import '@polkadot/api-augment/kusama';
import '@polkadot/rpc-augment';
import '@polkadot/types-augment';

import * as fs from 'fs/promises';
import { constants } from 'fs'
import { ApiPromise, WsProvider } from '@polkadot/api';
import type { FrameSystemEventRecord, } from '@polkadot/types/lookup';
import { BlockHash, DispatchError, DispatchInfo } from '@polkadot/types/interfaces/types.js';
import { newApi } from '../src/utils/polkadot-api.js';

const api = await newApi({provider: new WsProvider([
  'wss://kusama-rpc.polkadot.io'
])});

type BlockNumber = number;

// First block with OpenGov on kusama: 0x925eea1b3a1944fb592aa26b4e41c0926921d2e289a932942d6267a038cbcbce ; 15426014

//console.log(api.registry.lookup.types.map(o => o.type.path.toString()))
//console.log(        api.registry.getDefinition('PalletConvictionVotingVoteAccountVote'))

const folder = 'data';
const fromHash = await api.rpc.chain.getFinalizedHead();
const from = await api.rpc.chain.getBlock('0x925eea1b3a1944fb592aa26b4e41c0926921d2e289a932942d6267a038cbcbce');
const to = await api.rpc.chain.getBlock(fromHash);
await extractAll(api, from.block.header.number.toNumber(), to.block.header.number.toNumber(), folder);

type Extrinsic = {
  index: number,
  signer: string,
  args: any[],
  events: Array<{data: any, section: string, method: string}>,
}

type Event = {
  section: string;
  method: string;
  data: any;
}

function extractAssociatedEvents(index: number, allEvents: Array<FrameSystemEventRecord>): Array<Event> {
  return allEvents.filter(({ phase, event }) => (phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index)) && event.section != 'paraInclusion') // Somehow 'paraInclusion' pass former condition
    .map(({ event }) => event).map(({data, section, method, }) => {return {section, method, data: data.map(o => o.toJSON())};});
}

function extractEvent(events: Array<Event>, section: string, method: string): Event | undefined {
  return events.find((event) => event.section == section && event.method == method);
}

function extractExtrinsicSuccessEvent(events: Array<Event>): DispatchInfo | undefined {
  return extractEvent(events, 'system', 'ExtrinsicSuccess')?.data[0] as DispatchInfo
}

function extractExtrinsicFailedEvent(events: Array<Event>): DispatchError | undefined {
  // const decoded = api.registry.findMetaError(dispatchError.asModule);
  return extractEvent(events, 'system', 'ExtrinsicFailed')?.data[0] as DispatchError
}

function augmentExtrinsic({index, signer, args}: Omit<Extrinsic, 'success' | 'events'>, allEvents: Array<FrameSystemEventRecord>): Extrinsic {
  const events = extractAssociatedEvents(index, allEvents);
  return {
    index,
    signer,
    args,
    events
  }
}

async function extractExtrinsics(api: ApiPromise, block: number, extrinsicsOfInterest: Record<string/*section*/, Array<string>/*methods*/>) {
  const hash = await api.rpc.chain.getBlockHash(block);
  const { block: {extrinsics} } = await api.rpc.chain.getBlock(hash);
  const filteredExtrinsics = extrinsics
    .filter(({method: {section, method}}) => extrinsicsOfInterest[section]?.includes(method))
    .map(({signer, method: {section, method}, args}, index) => {
      return {index, section, method, signer: signer.toString(), args: args.map(arg => arg.toJSON())};
    });
  if (filteredExtrinsics.length > 0) {
    // There are some matching extrinsics in this block
    const apiAt = await api.at(hash);
    const allEvents = await apiAt.query.system.events();
    return filteredExtrinsics
      .reduce((previous, {section, method, ...rest}) => {
        previous[section] = {};
        previous[section][method] = augmentExtrinsic(rest, allEvents);
        return previous;
      }, {} as Record<string, Record<string, Extrinsic>>);
  }
}

async function extractAllExtrinsics(api: ApiPromise, from: number, to: number, extrinsicsOfInterest: Record<string/*section*/, Array<string>/*methods*/>) {
  const data: Record<BlockNumber, Record<string, Record<string, Extrinsic>>> = {};
  for (const i of Array(to-from).keys()) {
    const block = from+i;
    const extrinsics = await extractExtrinsics(api, block, extrinsicsOfInterest);
    if (extrinsics) {
      data[block] = extrinsics;
    }

    // And scheduler (for referenda)
  }
  return data;
}

function* ranges(from: number, to: number, increment: number): Generator<[number, number]> {
  let round = 0;
  const roundCount = Math.ceil((to - from) / increment);
  while (true) {
    const firstRound = (round == 0);
    const lastRound = (round == roundCount-1);
    const roundFrom = firstRound ? from : from - from%increment + round * increment;
    const roundTo = lastRound ? to : from - from%increment + (round+1) * increment;
    if (round >= roundCount) {
      break;
    }
    yield [roundFrom, roundTo];
    round++;
  }
}

async function checkFileExists(file: string): Promise<boolean> {
  return fs.access(file, constants.F_OK)
           .then(() => true)
           .catch(() => false)
}

type Delegation = {
  conviction: any;
  balance: number;
}

function createIndexes(allData: Record<number, Record<string, Record<string, Extrinsic>>>) {
  const entries = Array.from(Object.entries(allData));
  entries.sort(([block1], [block2]) => parseInt(block1) - parseInt(block2));
  const delegates = entries.reduce((index, [, extrinsics]) => {
    Object.entries(extrinsics).forEach(([section, methods]) => {
      if (section == 'convictionVoting') {
        Object.entries(methods).forEach(([method, {signer, args, events}]) => {
          if (extractExtrinsicSuccessEvent(events)) {
            // Ignore failed extrinsics
            if (method == 'delegate') { /* delegate(class: u16, to: MultiAddress, conviction: PalletConvictionVotingConviction, balance: u128) */
              const [track, to, conviction, balance] = args;
              const id = to.id as string;
              const existingDelegator = index[id] || {};
              const existingDelegatee: Record<number, Delegation> = existingDelegator[signer] || {};
              existingDelegatee[track] = {conviction, balance};
              existingDelegator[signer] = existingDelegatee;
              index[id] = existingDelegator;
            } else if (method == 'undelegate') { /* undelegate(class: u16) */
              const [track] = args;
              top:
              for (const [delegate, delegatees] of Object.entries(index)) {
                for (const [delegatee, delegations] of Object.entries(delegatees)) {
                  if (delegatee == signer) {
                    delete delegations[track];
                    index[delegate][delegatee] = delegations;
                    break top;
                  }
                }
              };
            }
          }
        });
      }
    });
    return index;
  }, {} as Record<string, Record<string, Record<number, Delegation>>>);

  return {delegates};
}

async function extractAll(api: ApiPromise, from: number, to: number, folder: string) {;
  const structure = {
    convictionVoting: ['delegate', 'undelegate', 'vote', 'removeVote', 'removeOtherVote'],
    referenda: ['submit']
  };

  const indexesFolder = `${folder}/indexes`;
  await fs.mkdir(folder, { recursive: true });
  await fs.mkdir(indexesFolder, { recursive: true });

  // TODO restore already persisted data
  let allData: Record<BlockNumber, Record<string, Record<string, Extrinsic>>> = {};
  for (const [rangeFrom, rangeTo] of ranges(from, to, 10_000)) {
    console.log(`Retrieving data for range [${rangeFrom}, ${rangeTo}]`);
    const fileName = `${folder}/${rangeFrom}-${rangeTo}.json`;
    if (!(await checkFileExists(fileName))) {
      const before = Date.now();
      const data = await extractAllExtrinsics(api, rangeFrom, rangeTo, structure);
      await fs.writeFile(fileName, JSON.stringify({meta: {span: {from, to}, structure}, data}));
      const after = Date.now();
      console.log(`Took ${(after-before)/1000}s`)

      const indexedBlockFolder = `${indexesFolder}/${rangeTo}`;
      await fs.mkdir(indexedBlockFolder, { recursive: true });

      allData = {...allData, ...data};

      const { delegates } = createIndexes(allData);
      if (delegates) {
        const delegatesFileName = `${indexedBlockFolder}/delegates.json`;
        await fs.writeFile(delegatesFileName, JSON.stringify({meta: {block: to}, data: delegates}));
      }
    }
  }
}

async function extractFirstReferendaBlock(api: ApiPromise, from: number): Promise<BlockHash> {
  let hash = await api.rpc.chain.getBlockHash(from);
  let modules = await api.registry.getModuleInstances("", "referenda");
  let time = Date.now();
  let count = 0;
  while(modules) {
    ++ count;
    const apiAt = await api.at(hash);
    modules = await apiAt.registry.getModuleInstances("", "referenda");
    const { block: {header} } = await api.rpc.chain.getBlock(hash);
    hash = header.parentHash;
    if (count % 1000 == 0) {
      const now = Date.now();
      console.log(`Blocks: ${count}; hash: ${hash} in ${now-time} ms`);
      time = now;
    }
  }
  console.log(`Last hash: ${hash}`);
  return hash;
}

api.disconnect();
