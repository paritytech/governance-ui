import type {
  AccountVote,
  Conviction,
  Referendum,
  ReferendumOngoing,
  Voting,
  VotingDelegating,
  SigningAccount,
} from '../types.js';

import React, {
  Dispatch,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useContext,
  createContext,
} from 'react';
import { ApiPromise, SubmittableResult } from '@polkadot/api';
import {
  QueryableConsts,
  QueryableStorage,
  SubmittableExtrinsic,
} from '@polkadot/api/types';
import { Registry } from '@polkadot/types-codec/types';
import {
  createBatchVotes,
  delegate,
  undelegate,
  getVotingFor,
} from '../chain/conviction-voting.js';
import { getAllMembers } from '../chain/fellowship-collective.js';
import { getAllReferenda, getAllTracks } from '../chain/referenda.js';
import { defaultNetwork, endpointsFor, Network, parse } from '../network.js';
import { err, ok, Result } from '../utils/index.js';
import { Cache, Destroyable, Readyable } from '../utils/cache.js';
import {
  CUSTOM_DELEGATES_STORE_NAME,
  dbNameFor,
  DB_VERSION,
  STORES,
  VOTE_STORE_NAME,
} from '../utils/db.js';
import { all, clear, open, save } from '../utils/indexeddb.js';
import { measured } from '../utils/performance.js';
import { batchAll, newApi, signAndSend } from '../utils/polkadot-api.js';
import { extractSearchParams } from '../utils/search-params.js';
import { WsReconnectProvider } from '../utils/ws-reconnect-provider.js';
import {
  AccountChainState,
  Action,
  Address,
  ChainProperties,
  ChainState,
  Delegate,
  DelegateRoleType,
  isAtLeastConnected,
  PersistedDataContext,
  Processing,
  Report,
  State,
} from './types.js';
import { fetchReferenda } from '../utils/polkassembly.js';
import BN from 'bn.js';

// Auto follow chain updates? Only if user settings? Show notif? Only if impacting change?
// Revisit if/when ChainState is persisted

// Actions
// TODO
// Heartbeat (to detect no new finalized blocks are reeived, keep track of delta between last received and now)

// Startup
// settings, overriden by Env variable, overriden by query params, overriden by user settings? offer user confirmation
// network, allow to restore chain db
// endpoints, allow to connect to chain
// if no endpoints provided, default to network endpoints
// endpoints and network: must match network
// only endpoints: sets network

/**
 * @param votes
 * @param referenda
 * @returns filter away `votes` that do not map to `referenda`
 */
function filterOldVotes(
  votes: Map<number, AccountVote>,
  referenda: Map<number, ReferendumOngoing>
): Map<number, AccountVote> {
  return new Map(Array.from(votes).filter(([index]) => referenda.has(index)));
}

/**
 * Extracts user's votes for a set of referenda
 * @param address user's account address
 * @param allVotings all votings retrieved from conviction pallet state
 * @param referenda a map of referenda to extracts the votings for
 * @returns a map of catsing votes for the target referenda by the account
 */
function extractUserVotes(
  address: Address,
  allVotings: Map<Address, Map<number, Voting>>,
  referenda: Map<number, Referendum>
): Map<number, AccountVote> {
  // Go through user votes and restore the ones relevant to `referenda`
  const votes = new Map<number, AccountVote>();
  const votings = allVotings.get(address);
  if (votings) {
    votings.forEach((voting) => {
      if (voting.type === 'casting') {
        voting.votes.forEach((accountVote, index) => {
          if (referenda.has(index)) {
            votes.set(index, accountVote);
          }
        });
      }
    });
  }
  return votes;
}

/**
 * return all delegations for a specific address
 * @param address the address to extract the delegations for.
 * @param allVotings all votings retrieved from conviction pallet state
 * @returns a map of delegations by the account per each track
 */
export function getAllDelegations(
  address: Address,
  allVotings: Map<Address, Map<number, Voting>>
): Map<number, VotingDelegating> {
  const delegates = new Map<number, VotingDelegating>();
  const votings = allVotings.get(address);
  if (votings) {
    votings.forEach((voting, trackId) => {
      // filter the delegatings.
      if (voting.type === 'delegating') {
        delegates.set(trackId, voting);
      }
    });
  }
  return delegates;
}

export function getAllVotes(
  votes: Map<number, AccountVote>,
  allVotings: Map<Address, Map<number, Voting>>,
  referenda: Map<number, ReferendumOngoing>,
  connectedAddress: Address | null
): Map<number, AccountVote> {
  const currentVotes = filterOldVotes(votes, referenda);
  if (connectedAddress) {
    const onChainVotes = extractUserVotes(
      connectedAddress,
      allVotings,
      referenda
    );
    return new Map([...currentVotes, ...onChainVotes]);
  } else {
    return currentVotes;
  }
}

/**
 * @param referenda
 * @returns a subset containing only ReferendumOngoing
 */
export function filterOngoingReferenda(
  referenda: Map<number, Referendum>
): Map<number, ReferendumOngoing> {
  return new Map(
    [...referenda].filter(([, v]) => v.type == 'ongoing') as [
      number,
      ReferendumOngoing
    ][]
  );
}

/**
 * @param referenda
 * @param votes
 * @returns a subset of referenda not yet voted on
 */
export function filterToBeVotedReferenda(
  referenda: Map<number, ReferendumOngoing>,
  votes: Map<number, AccountVote>
): Map<number, ReferendumOngoing> {
  return new Map([...referenda].filter(([index]) => !votes.has(index)));
}

export function extractBalance(state: State): BN | undefined {
  if (state.type == 'ConnectedState') {
    return state.account?.balance;
  }
}

export function extractDelegations(state: State) {
  // get delegations
  const allVotings =
    state.type === 'ConnectedState' ? state.account?.allVotings : undefined;
  let delegations: Map<number, VotingDelegating> = new Map();
  if (allVotings && state.connectedAddress) {
    delegations = getAllDelegations(state.connectedAddress, allVotings);
  }
  return delegations;
}

export function extractChainInfo(state: State):
  | {
      decimals: number | undefined;
      unit: string | undefined;
      ss58: number | undefined;
    }
  | undefined {
  if (state.type == 'ConnectedState') {
    return {
      decimals: state.chain.properties.tokenDecimals[0],
      unit: state.chain.properties.tokenSymbols[0],
      ss58: state.chain.properties.ss58Format,
    };
  }
}

export function extractIsProcessing(state: State): boolean {
  return !!state?.processingReport;
}

export function extractRoles(
  address: string,
  state: State
): DelegateRoleType[] {
  if (state.type == 'ConnectedState') {
    if (state.chain.fellows.has(address)) {
      return ['fellow'];
    }
  }
  return [];
}

function error(message: string): Report {
  return {
    type: 'Error',
    message,
  };
}

function incorrectTransitionError(
  previousState: State,
  action: Action
): Report {
  return error(
    `Incorrect transition, can't apply ${action.type} to ${previousState.type}`
  );
}

function withNewReport(previousState: State, report: Report): State {
  const previousReports = previousState.reports || [];
  return {
    ...previousState,
    reports: [report, ...previousReports],
  };
}

function reducer(previousState: State, action: Action): State {
  // Note that unlucky timing might lead to overstepping changes (triggered via listeners registered just above)
  // So applying changes must be indempotent
  switch (action.type) {
    case 'SetConnectedAddress': {
      const { connectedAddress } = action;
      if (previousState.type == 'ConnectedState') {
        return {
          ...previousState,
          connectedAddress,
          // Clear previous account data
          account: undefined,
        };
      } else {
        return {
          ...previousState,
          connectedAddress,
        };
      }
    }
    case 'SetRestored': {
      const { network, votes, customDelegates } = action;
      return {
        ...previousState,
        type: 'RestoredState',
        network,
        votes,
        customDelegates,
      };
    }
    case 'UpdateConnectivity': {
      const { connectivity } = action;
      if ('connectivity' in previousState) {
        return {
          ...previousState,
          connectivity,
        };
      } else {
        return withNewReport(
          previousState,
          incorrectTransitionError(previousState, action)
        );
      }
    }
    case 'AddReport': {
      return withNewReport(previousState, action.report);
    }
    case 'RemoveReport': {
      const previousReports = previousState.reports || [];
      previousReports.splice(action.index, 1);
      return {
        ...previousState,
        reports: [...previousReports],
      };
    }
    case 'SetProcessing': {
      return {
        ...previousState,
        processingReport: action.report,
      };
    }
    case 'UpdateChainDetails': {
      const { details } = action;
      if (previousState.type == 'ConnectedState') {
        // Already connected, update connectivity
        // But do not update chain details
        return {
          ...previousState,
          chain: previousState.chain,
        };
      } else if (previousState.type == 'RestoredState') {
        // First block received
        return {
          ...previousState,
          type: 'ConnectedState',
          chain: details,
          details: new Map(),
        };
      } else {
        return withNewReport(
          previousState,
          incorrectTransitionError(previousState, action)
        );
      }
    }
    case 'UpdateChainAccountDetails': {
      const { details } = action;
      if (previousState.type == 'ConnectedState') {
        return {
          ...previousState,
          account: details,
        };
      } else {
        return withNewReport(
          previousState,
          incorrectTransitionError(previousState, action)
        );
      }
    }
    case 'StoreReferendumDetails': {
      const { details } = action;
      const previousDetails = previousState.details;

      return {
        ...previousState,
        details: new Map([...previousDetails, ...details]),
      };
    }
    case 'CastVote':
      if ('votes' in previousState) {
        const newVotes = previousState.votes || new Map();
        newVotes.set(action.index, action.vote);
        return {
          ...previousState,
          votes: new Map(newVotes),
        };
      } else {
        return withNewReport(
          previousState,
          incorrectTransitionError(previousState, action)
        );
      }
    case 'ClearVotes':
      if ('votes' in previousState) {
        return {
          ...previousState,
          votes: new Map(),
        };
      } else {
        return withNewReport(
          previousState,
          incorrectTransitionError(previousState, action)
        );
      }
    case 'SetIndexes':
      return {
        ...previousState,
        indexes: action.data,
      };
    case 'SetDelegates':
      return {
        ...previousState,
        delegates: action.data || [],
      };
    case 'AddCustomDelegate': {
      const customDelegates = previousState.customDelegates;
      customDelegates.push(action.delegate);
      return {
        ...previousState,
        ...customDelegates,
      };
    }
    case 'RemoveCustomDelegate': {
      const customDelegates = previousState.customDelegates;
      customDelegates.splice(action.index, 1);
      return {
        ...previousState,
        ...customDelegates,
      };
    }
  }
}

// Persisted data

async function restorePersisted(
  db: IDBDatabase
): Promise<PersistedDataContext> {
  const votes = (await all<AccountVote>(db, VOTE_STORE_NAME)) as Map<
    number,
    AccountVote
  >;
  const customDelegates = (await all<Delegate>(
    db,
    CUSTOM_DELEGATES_STORE_NAME
  )) as Map<number, Delegate>;
  return {
    votes,
    customDelegates: new Array(...customDelegates.values()),
  };
}

function getProperties(registry: Registry): ChainProperties {
  const properties = registry.getChainProperties();
  if (properties) {
    return {
      ss58Format: properties.ss58Format.unwrapOr(undefined)?.toNumber(),
      tokenDecimals: properties.tokenDecimals
        .unwrapOrDefault()
        .map((s) => s.toNumber()),
      tokenSymbols: properties.tokenSymbol
        .unwrapOrDefault()
        .map((s) => s.toString()),
    };
  }
  return { tokenDecimals: [], tokenSymbols: [] };
}

export async function fetchChainState(
  api: {
    consts: QueryableConsts<'promise'>;
    query: QueryableStorage<'promise'>;
  },
  registry: Registry
): Promise<ChainState> {
  const tracks = getAllTracks(api);
  const referenda = await getAllReferenda(api);
  const fellows = await getAllMembers(api);
  const properties = getProperties(registry);
  return { properties, tracks, referenda, fellows };
}

export async function fetchAccountChainState(
  api: {
    consts: QueryableConsts<'promise'>;
    query: QueryableStorage<'promise'>;
  },
  connectedAddress: Address
): Promise<AccountChainState> {
  const allVotings = new Map<Address, Map<number, Voting>>();
  allVotings.set(connectedAddress, await getVotingFor(api, connectedAddress));
  const account = await api.query.system.account(connectedAddress);
  const balance = account.data.free.toBn();
  return { allVotings, balance };
}

class DBReady implements Readyable<IDBDatabase>, Destroyable {
  ready: Promise<IDBDatabase>;
  constructor(name: string) {
    this.ready = open(name, STORES, DB_VERSION);
  }
  async destroy(): Promise<void> {
    const db = await this.ready;
    db.close();
  }
}

class ApiReady implements Readyable<ApiPromise>, Destroyable {
  ready: Promise<ApiPromise>;
  constructor(endpoints: string[]) {
    this.ready = measured(
      'api',
      async () =>
        (await newApi({ provider: new WsReconnectProvider(endpoints) }))
          .isReadyOrError
    );
  }
  async destroy(): Promise<void> {
    const api = await this.ready;
    await api.disconnect();
  }
}

export const DB_CACHE = new Cache(DBReady);
export const API_CACHE = new Cache(ApiReady);

export class Updater {
  readonly #stateAccessor;
  readonly #dispatch;
  unsub: VoidFunction | undefined;

  constructor(stateAccessor: () => State, dispatch: Dispatch<Action>) {
    this.#stateAccessor = stateAccessor;
    this.#dispatch = dispatch;
  }

  async start() {
    try {
      this.unsub = await updateChainState(this.#stateAccessor, this.#dispatch);
    } catch (e: any) {
      await this.addReport(error(e.toString()));
    }
  }

  stop() {
    this.unsub?.();
  }

  async castVote(index: number, vote: AccountVote) {
    this.#dispatch({
      type: 'CastVote',
      index,
      vote,
    });

    // Persist votes before they are broadcasted on chain
    const state = this.#stateAccessor();
    if (state.type == 'ConnectedState') {
      const db = await DB_CACHE.getOrCreate(dbNameFor(state.network));
      await save(db, VOTE_STORE_NAME, index, vote);
    } else {
      await this.addReport(error('Must be connected to cast a vote'));
    }
  }

  async signAndSendVotes(
    { account, signer }: SigningAccount,
    accountVotes: Map<number, AccountVote>
  ) {
    const state = this.#stateAccessor();
    const { type, connectivity } = state;
    if (type == 'ConnectedState' && isAtLeastConnected(connectivity)) {
      const db = await DB_CACHE.getOrCreate(dbNameFor(state.network));
      const api = await API_CACHE.getOrCreate(connectivity.endpoints);
      const votes = createBatchVotes(api, accountVotes);
      await signAndSend(account.address, signer, votes);

      // Clear user votes
      await clear(db, VOTE_STORE_NAME);

      this.#dispatch({
        type: 'ClearVotes',
      });
    } else {
      await this.addReport(error('Must be connected to send votes'));
    }
  }

  async getApi(state: State): Promise<ApiPromise | null> {
    const { type, connectivity } = state;
    if (type == 'ConnectedState' && isAtLeastConnected(connectivity)) {
      return await API_CACHE.getOrCreate(connectivity.endpoints);
    }
    return null;
  }

  async delegate(
    address: string,
    tracks: number[],
    balance: BN,
    conviction: Conviction
  ): Promise<Result<SubmittableExtrinsic<'promise', SubmittableResult>>> {
    const state = this.#stateAccessor();
    const api = await this.getApi(state);
    if (api) {
      const txs = tracks.map((track) =>
        delegate(api, track, address, conviction, balance)
      );
      return ok(batchAll(api, txs));
    } else {
      const report = error('Failed to retrieve Api');
      await this.addReport(report);
      return err(new Error(report.message));
    }
  }

  async undelegate(
    tracks: number[]
  ): Promise<Result<SubmittableExtrinsic<'promise', SubmittableResult>>> {
    const state = this.#stateAccessor();
    const api = await this.getApi(state);
    if (api) {
      const txs = tracks.map((track) => undelegate(api, track));
      return ok(batchAll(api, txs));
    } else {
      const report = error('Failed to retrieve Api');
      await this.addReport(report);
      return err(new Error(report.message));
    }
  }

  async handleCallResult(callResult: SubmittableResult) {
    const { status } = callResult;
    if (status.isBroadcast) {
      this.setProcessingReport({
        isTransient: false,
        message: 'The transaction is submitted.',
      });
    } else if (status.isInBlock) {
      this.setProcessingReport({
        isTransient: false,
        message: 'The transaction is included in the block',
      });
    } else if (status.isFinalized) {
      this.setProcessingReport({
        isTransient: true,
        message: 'The transaction is finalized.',
      });
    }
  }

  async setConnectedAddress(connectedAddress: string | null) {
    this.#dispatch({
      type: 'SetConnectedAddress',
      connectedAddress,
    });

    // connectedAddress exists, fetch associated chain info
    if (connectedAddress) {
      const state = this.#stateAccessor();
      const api = await this.getApi(state);
      if (api) {
        await updateChainDetails(api, this.#dispatch, connectedAddress);
      }
      // When restoring address during startup API won't be available; ignoring.
      // Will become irrelevant once this is persisted via the state.
    }
  }

  async addReport(report: Report) {
    this.#dispatch({
      type: 'AddReport',
      report,
    });
  }

  async removeReport(index: number) {
    this.#dispatch({
      type: 'RemoveReport',
      index,
    });
  }

  async addCustomDelegate(delegate: Delegate) {
    this.#dispatch({
      type: 'AddCustomDelegate',
      delegate,
    });

    const state = this.#stateAccessor();
    if (state.type == 'ConnectedState') {
      const db = await DB_CACHE.getOrCreate(dbNameFor(state.network));
      await save(
        db,
        CUSTOM_DELEGATES_STORE_NAME,
        state.customDelegates.length + 1,
        delegate
      );
    } else {
      await this.addReport(error('Must be connected to add custom delegate'));
    }
  }

  async removeCustomDelegate(index: number) {
    this.#dispatch({
      type: 'RemoveCustomDelegate',
      index,
    });
  }

  async setProcessingReport(processing: Processing | undefined) {
    this.#dispatch({
      type: 'SetProcessing',
      report: processing,
    });
  }
}

const DEFAULT_INITIAL_STATE: State = {
  type: 'InitialState',
  connectivity: { type: navigator.onLine ? 'Online' : 'Offline' },
  connectedAddress: null,
  details: new Map(),
  indexes: {},
  delegates: [],
  customDelegates: [],
};

type Reducer = (previousState: State, action: Action) => State;

type StateUpdate = {
  when: Date;
  action: Action;
  previousState: State;
  newState: State;
};

const history = new Array<StateUpdate>();

function useReducerWithHistory(
  reducer: Reducer,
  history: Array<StateUpdate>
): Reducer {
  return useCallback(
    (previousState: State, action: Action) => {
      const newState = reducer(previousState, action);
      history.push({ when: new Date(), action, previousState, newState });
      return newState;
    },
    [reducer]
  );
}

async function fetchDelegates(network: Network): Promise<Result<Delegate[]>> {
  const url = `https://paritytech.github.io/governance-ui/data/${network.toLowerCase()}/delegates.json`;
  const delegates = await fetch(url);
  if (delegates.ok) {
    const data = (await delegates.json()) as Array<Delegate>;
    return ok(data);
  } else {
    return err(new Error(`Can't access ${url}`));
  }
}

/**
 * Called when the connected network has changed.
 * Underlying `indexeddb`, `api` and associated resources will refreshed.
 * Also calls `dispatchEndpointsChange`.
 *
 * @param network
 * @param dispatch
 */
async function dispatchNetworkChange(
  stateAccessor: () => State,
  dispatch: Dispatch<Action>,
  network: Network,
  rpcParam: string | null
): Promise<VoidFunction | undefined> {
  const db = await open(dbNameFor(network), STORES, DB_VERSION);
  const restoredState = await measured('fetch-restored-state', () =>
    restorePersisted(db)
  );
  dispatch({
    type: 'SetRestored',
    network,
    ...restoredState,
  });

  // Fetch delegates
  const delegates = await fetchDelegates(network);
  if (delegates.type == 'ok') {
    dispatch({
      type: 'SetDelegates',
      data: delegates.value,
    });
  } else {
    dispatchAddReport(dispatch, {
      type: 'Warning',
      message: delegates.error.message,
    });
  }

  return dispatchEndpointsParamChange(
    stateAccessor,
    dispatch,
    network,
    rpcParam
  );
}

function dispatchAddReport(dispatch: Dispatch<Action>, report: Report) {
  dispatch({
    type: 'AddReport',
    report,
  });
}

async function dispatchEndpointsParamChange(
  stateAccessor: () => State,
  dispatch: Dispatch<Action>,
  network: Network,
  rpcParam: string | null
): Promise<VoidFunction | undefined> {
  if (rpcParam) {
    const endpoints = extractEndpointsFromParam(rpcParam);
    if (endpoints.type == 'ok') {
      return await dispatchEndpointsChange(
        stateAccessor,
        dispatch,
        network,
        endpoints.value
      );
    } else {
      dispatchAddReport(
        dispatch,
        error(`Invalid 'rpc' param ${rpcParam}: ${endpoints.error}`)
      );
    }
  } else {
    return await dispatchEndpointsChange(
      stateAccessor,
      dispatch,
      network,
      endpointsFor(network)
    );
  }
}

async function loadAndDispatchReferendaMetaData(
  dispatch: Dispatch<Action>,
  referendaIndexes: Array<number>,
  network: Network
) {
  const indexes = Array.from(referendaIndexes);
  indexes.forEach(async (index) => {
    const details = await measured('fetch-referenda', () =>
      fetchReferenda(network, index)
    );
    if (details.type == 'ok') {
      dispatch({
        type: 'StoreReferendumDetails',
        details: new Map([[index, details.value]]),
      });
    } else {
      // Ignore error as it's not blocking
      console.error(
        `Error while accessing referenda details: ${details.error.message}`
      );
    }
  });
}

async function updateChainDetails(
  api: {
    consts: QueryableConsts<'promise'>;
    query: QueryableStorage<'promise'>;
  },
  dispatch: Dispatch<Action>,
  connectedAccount: string
) {
  const details = await measured('fetch-account-chain-details', () =>
    fetchAccountChainState(api, connectedAccount)
  );

  dispatch({
    type: 'UpdateChainAccountDetails',
    details,
  });
}

async function dispatchEndpointsChange(
  stateAccessor: () => State,
  dispatch: Dispatch<Action>,
  network: Network,
  endpoints: string[]
): Promise<VoidFunction> {
  const api = await API_CACHE.getOrCreate(endpoints);
  // TODO listen for deconnection/stales and update accordingly

  // Connection has been established
  const lastHeader = await api.rpc.chain.getHeader();
  dispatch({
    type: 'UpdateConnectivity',
    connectivity: {
      type: 'Connected',
      endpoints,
      block: lastHeader.number.toNumber(),
    },
  });

  return await api.rpc.chain.subscribeFinalizedHeads(async (header) => {
    // New block has been received, we are up-to-date with the chain
    dispatch({
      type: 'UpdateConnectivity',
      connectivity: {
        type: 'Following',
        endpoints,
        block: header.number.toNumber(),
      },
    });

    const state = stateAccessor();
    const apiAt = await api.at(header.hash);
    // TODO rely on subs, do not re-fetch whole state each block
    const details = await measured('fetch-chain-details', () =>
      fetchChainState(apiAt, api.registry)
    );

    dispatch({
      type: 'UpdateChainDetails',
      details,
    });

    const connectedAddress = state.connectedAddress;
    if (connectedAddress) {
      await updateChainDetails(apiAt, dispatch, connectedAddress);
    }

    // Trigger fetch of missing referenda metadata
    const previousReferendaIndexes = Array.from(state.details.keys());
    const newReferendaIndexes = Array.from(
      filterOngoingReferenda(details.referenda).keys()
    );
    const missingReferendaIndexes = newReferendaIndexes.filter(
      (index) => !previousReferendaIndexes.includes(index)
    );
    await loadAndDispatchReferendaMetaData(
      dispatch,
      missingReferendaIndexes,
      network
    );
  });
}

function isValidEnpoint(endpoint: string): boolean {
  try {
    const url = new URL(endpoint);
    return url.protocol === 'ws:' || url.protocol === 'wss:';
  } catch (err) {
    return false;
  }
}

export function validateEnpoints(endpoints: string[]): Result<string[]> {
  const invalidEndpoints = endpoints.filter(
    (endpoint) => !isValidEnpoint(endpoint)
  );
  if (invalidEndpoints.length !== 0) {
    return err(
      new Error(
        `Some of provided rpcs are not valid endpoints: ${invalidEndpoints}`
      )
    );
  }
  return ok(endpoints);
}

export type NetworkParams = {
  networkParam: string | null;
  rpcParam: string | null;
};

export function currentParams(): NetworkParams {
  const [networkParam, rpcParam] = extractSearchParams(window.location.search, [
    'network',
    'rpc',
  ]);
  return {
    networkParam,
    rpcParam,
  };
}

export function addParamsChangeListener(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener('pushstate', onChange);
  window.addEventListener('replacestate', onChange);
}

export function removeQueryParamsChangeListener(
  onChange: EventListenerOrEventListenerObject
) {
  window.removeEventListener('popstate', onChange);
  window.removeEventListener('pushstate', onChange);
  window.removeEventListener('replacestate', onChange);
}

function extractEndpointsFromParam(s: string): Result<string[]> {
  return validateEnpoints(s.split('|'));
}

/**
 * It's assumed that provided state and dependencies are fully initialized.
 * e.g. a 'ConnectedState' should provide a connected `api`
 *
 * @param state
 * @param dispatch
 */
async function updateChainState(
  stateAccessor: () => State,
  dispatch: Dispatch<Action>
): Promise<VoidFunction> {
  // First setup listeners

  let currentUnsub: VoidFunction | undefined;

  function updateUnsub(unsub: VoidFunction | undefined) {
    if (currentUnsub) {
      currentUnsub();
    }
    currentUnsub = unsub;
  }

  /*addAccountListener((accounts) => {
    // TODO
    // Updated votings whenever selected accounts are updated
  });*/

  addParamsChangeListener(async () => {
    // Track changes to network related query parameters
    // Only consider values set, absent values are not consider (keep unchanged)
    // If `network` is set, `endpoints` if unset will default to Network default
    const state = stateAccessor();
    if (state.type == 'ConnectedState') {
      // Only consider ConnectedState
      const { networkParam, rpcParam } = currentParams();
      if (networkParam && rpcParam) {
        dispatchAddReport(
          dispatch,
          error(`Both rpc and network params can't be set at the same time`)
        );
      } else {
        if (networkParam) {
          // `network` param is set and takes precedence, `endpoints` might
          const network = parse(networkParam);
          if (network.type == 'ok') {
            if (state.network != network.value) {
              // Only react to network changes
              updateUnsub(
                await dispatchNetworkChange(
                  stateAccessor,
                  dispatch,
                  network.value,
                  rpcParam
                )
              );
            }
          } else {
            dispatchAddReport(
              dispatch,
              error(`Invalid 'network' param ${networkParam}: ${network.error}`)
            );
          }
        } else if (rpcParam) {
          // Only `rpc` param is set, reconnect using those
          updateUnsub(
            await dispatchEndpointsParamChange(
              stateAccessor,
              dispatch,
              state.network,
              rpcParam
            )
          );
        } else {
          // No network provided; noop
        }
      }
    }
  });

  window.addEventListener('online', async () => {
    dispatch({
      type: 'UpdateConnectivity',
      connectivity: { type: 'Online' },
    });
  });

  window.addEventListener('offline', () =>
    dispatch({
      type: 'UpdateConnectivity',
      connectivity: { type: 'Offline' },
    })
  );

  window.addEventListener('unhandledrejection', (event) =>
    dispatchAddReport(
      dispatch,
      error(`Unhandled promise rejection for ${event.promise}: ${event.reason}`)
    )
  );

  async function getNetwork(
    networkParam: string | null
  ): Promise<Result<Network>> {
    if (networkParam) {
      const network = parse(networkParam);
      if (network.type == 'ok') {
        return ok(network.value);
      } else {
        return network;
      }
    } else {
      return ok(await defaultNetwork());
    }
  }

  const { networkParam, rpcParam } = currentParams();
  const network = await getNetwork(networkParam);
  if (network.type == 'ok') {
    console.log(`Using network ${network.value}`);

    updateUnsub(
      await dispatchNetworkChange(
        stateAccessor,
        dispatch,
        network.value,
        rpcParam
      )
    );
  } else {
    dispatchAddReport(dispatch, error(network.error.message));
  }

  return () => {
    console.log('Unsub');
    currentUnsub?.();
  };
}

/**
 * Provides the lifeCycle context
 */
interface ILifeCycleContext {
  state: State;
  updater: Updater;
}
const appLifeCycleContext = createContext<ILifeCycleContext>(
  {} as ILifeCycleContext
);
export const useAppLifeCycle = () => useContext(appLifeCycleContext);
export const AppLifeCycleProvider = ({
  initialState = DEFAULT_INITIAL_STATE,
  children,
}: {
  children: React.ReactNode;
  initialState?: State;
}) => {
  const [state, dispatch] = useReducer(
    useReducerWithHistory(reducer, history),
    initialState
  );
  const lastState = useRef(state);

  // Allows to access current State
  const stateAccessor = useCallback(() => lastState.current, []);
  const updater = new Updater(stateAccessor, dispatch);

  useEffect(() => {
    lastState.current = state;
  }, [state]);

  useEffect(() => {
    async function start() {
      await updater.start();
    }

    start();

    return () => {
      updater.stop();
    };
  }, []);

  return (
    <appLifeCycleContext.Provider value={{ state, updater }}>
      {children}
    </appLifeCycleContext.Provider>
  );
};

export * from './types';
