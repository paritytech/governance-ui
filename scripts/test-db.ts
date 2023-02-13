import '@polkadot/api-augment/kusama';
import '@polkadot/rpc-augment';
import '@polkadot/types-augment';

import * as fs from 'fs/promises';
import { constants } from 'fs'
import { ApiPromise, WsProvider } from '@polkadot/api';
import { GenericExtrinsic, Vec } from '@polkadot/types';
import { AnyTuple } from '@polkadot/types-codec/types/helpers.js';
import { BlockHash } from '@polkadot/types/interfaces/types.js';
import { toVote } from '../src/chain/conviction-voting.js';
import { AccountVote } from '../src/types.js';
import { newApi } from '../src/utils/polkadot-api.js';

const api = await newApi({provider: new WsProvider([
  'wss://kusama-rpc.polkadot.io'
  /*'wss://kusama.api.onfinality.io/public-ws'*/
])});


/*const { block: {header, extrinsics} } = await api.rpc.chain.getBlock("0x152ff2274d34fc071c67d366726ab75a016bb65a5f66a8c63837262b17c774c4");
extrinsics.forEach(({ meta, method: { args, method, section } }) => {
  console.log(method, section)
})*/

type BlockNumber = number;

type ConvictionVotingModule = {
  votes: Record<BlockNumber, Array<[[number, string], AccountVote]>>,
}
/*
const { block: { header: { number } } } = await api.rpc.chain.getBlock();
const blockNumber = number.toNumber();
const blockChunkSize = 10_000;

while (true) {
  let round = 0;
  const fromBlock = blockNumber;
  const toBlock = blockNumber % blockChunkSize;
  const data = await extractConvictionVoting(api, fromBlock, toBlock);
  ++round;
  if (data) {
    await fs.writeFile(`data-${toBlock}.json`, JSON.stringify(data));
  } else {
    break;
  }
}*/


// 0x925eea1b3a1944fb592aa26b4e41c0926921d2e289a932942d6267a038cbcbce ; 15426014
//const hash = await extractFirstConvictionVotingBlock(api, 15_428_000);
//console.log(`last hash`, hash.toString())

const fromHash = await api.rpc.chain.getFinalizedHead();
const from = await api.rpc.chain.getBlock(fromHash);
const to = await api.rpc.chain.getBlock('0x925eea1b3a1944fb592aa26b4e41c0926921d2e289a932942d6267a038cbcbce');
await extractAll(api, from.block.header.number.toNumber(), to.block.header.number.toNumber());

function filterExtrinsics(extrinsics: Vec<GenericExtrinsic<AnyTuple>>, sectionName: string, methodName: string): Array<GenericExtrinsic<AnyTuple>> {
  return extrinsics.filter(({ method: {method, section} }) => section == sectionName && method == methodName);
}

//   var modules = await api.registry.getModuleInstances("", "referenda");

async function extractConvictionVoting(api: ApiPromise, from: number, to: number): Promise<ConvictionVotingModule> {
  const allVotes: Record<BlockNumber, Array<[[number, string], AccountVote]>> = {};
  for (const i of Array(from-to).keys()) {
    const block = from-i;
    const hash = await api.rpc.chain.getBlockHash(block);
    //const apiAt = await api.at(hash);
    //const events = await apiAt.query.system.events();
    /*const events = allRecords
    .filter(({ phase }) =>
        phase.isApplyExtrinsic &&
        phase.asApplyExtrinsic.eq(index)
    )
    .map(({ event }) => `${event.section}.${event.method}`);*/
    //console.log(events.length)
    const { block: {header, extrinsics} } = await api.rpc.chain.getBlock(hash);
    const votes = filterExtrinsics(extrinsics, 'convictionVoting', 'vote') as Array<GenericExtrinsic<any>>;
    if (votes.length > 0) {
      allVotes[header.number.toNumber()] = votes.map(({signer, method: {args}}) => [[args[0], signer.toString()], toVote(args[1])]);
    }
    const unvotes = filterExtrinsics(extrinsics, 'convictionVoting', 'unvote') as Array<GenericExtrinsic<any>>;
    const delegates = filterExtrinsics(extrinsics, 'convictionVoting', 'delegate') as Array<GenericExtrinsic<any>>;
  }
  return {votes: allVotes};
}

//const hash = (await api.rpc.chain.getFinalizedHead());;

function* ranges(from: number, to: number, increment: number): Generator<[number, number]> {
  let round = 0;
  const roundCount = Math.ceil((from - to) / increment);
  while (true) {
    const firstRound = (round == 0);
    const lastRound = (round == roundCount-1);
    const roundFrom = firstRound ? from : from - from%increment - (round-1) * increment;
    const roundTo = lastRound ? to : from - from%increment - round * increment;
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

type Chunk = {
  meta: {
    structure: string
    span: {
      from: number,
      to: number
    }
  }
  data: any
}

async function extractAll(api: ApiPromise, from: number, to: number) {
  for (const [rangeFrom, rangeTo] of ranges(from, to, 10_000)) {
    console.log(rangeFrom, rangeTo)
    const fileName = `data/${rangeFrom}-${rangeTo}.json`;
    if (!(await checkFileExists(fileName))) {
      const before = Date.now();
      const data = await extractConvictionVoting(api, rangeFrom, rangeTo);
      await fs.writeFile(fileName, JSON.stringify(data));
      const after = Date.now();
      console.log(`Took ${(after-before)/1000}s`)
    }
  }
}

// Blocks: 22000; hash: 0xb6f31c2c518138d61d615cea2749cfa4943edebde9e660c405a90b16be444d25 in 167367 ms

async function extractFirstConvictionVotingBlock(api: ApiPromise, from: number): Promise<BlockHash> {
  //let hash = (await api.rpc.chain.getFinalizedHead());
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

/*
const apiAt = await api.at("0xcd9b8e2fc2f57c4570a86319b005832080e0c478ab41ae5d44e23705872f5ad3");
console.log("", await api.registry.getModuleInstances("", "referenda"));
const latestHash = await api.rpc.chain.getFinalizedHead();
const latestBlock = await api.rpc.chain.getBlock(latestHash);
const { meta, method: { args, method, section } } = latestBlock.block.extrinsics.at(0)!!;
console.log(meta.toHuman(), method, section);
console.log("first", await apiAt.registry.getModuleInstances("", "referenda"));
//console.log(api.consts);
//api.tx.referenda.submit()

// If referenda unknown: null
const referenda = await api.query.referenda.referendumInfoFor(48);
console.log(`Referenda: ${JSON.stringify(referenda.toHuman())}`);

const allEntries = await api.query.referenda.referendumInfoFor.entries();
*/
//console.log(allEntries, await api.query.referenda.referendumCount());
/*allEntries.forEach(([{ args: [id] }, referendum]) => {
  console.log(`${id}: Referendum: ${JSON.stringify(referendum.toHuman())}`);
});
*/

api.disconnect();
