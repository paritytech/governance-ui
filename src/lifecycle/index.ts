import { Dispatch, useCallback, useEffect, useReducer, useRef } from 'react';
import { ApiPromise } from '@polkadot/api';
import { QueryableConsts, QueryableStorage } from '@polkadot/api/types';
import { getVotingFor, submitBatchVotes } from '../chain/conviction-voting.js';
import { getAllMembers } from '../chain/fellowship-collective.js';
import { getAllReferenda, getAllTracks } from '../chain/referenda.js';
import { SigningAccount } from '../contexts/index.js';
import { DEFAULT_NETWORK, endpointsFor, Network, parse } from '../network.js';
import {
  AccountVote,
  Referendum,
  ReferendumOngoing,
  Voting,
} from '../types.js';
import { err, ok, Result } from '../utils/index.js';
import { Cache, Destroyable, Readyable } from '../utils/cache.js';
import { dbNameFor, DB_VERSION, STORES, VOTE_STORE_NAME } from '../utils/db.js';
import { all, clear, open, save } from '../utils/indexeddb.js';
import { measured } from '../utils/performance.js';
import { newApi } from '../utils/polkadot-api.js';
import { extractSearchParams } from '../utils/search-params.js';
import { WsReconnectProvider } from '../utils/ws-reconnect-provider.js';
import type {
  Action,
  Address,
  ChainState,
  Delegate,
  PersistedDataContext,
  Report,
  State,
} from './types.js';

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
 * @param votings
 * @param referenda
 * @returns
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

export function getAllVotes(
  votes: Map<number, AccountVote>,
  allVotings: Map<Address, Map<number, Voting>>,
  referenda: Map<number, ReferendumOngoing>,
  connectedAccount: Address | null
): Map<number, AccountVote> {
  const currentVotes = filterOldVotes(votes, referenda);
  if (connectedAccount) {
    const onChainVotes = extractUserVotes(
      connectedAccount,
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

function incorrectTransitionError(previousState: State): Report {
  return {
    type: 'Error',
    message: `Incorrect transition: ${previousState.type}`,
  };
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
    case 'SetConnectedAccountAction': {
      const { connectedAccount } = action;
      return {
        ...previousState,
        connectedAccount,
      };
    }
    case 'SetRestoredAction': {
      const { network, votes } = action;
      return {
        ...previousState,
        type: 'RestoredState',
        network,
        votes,
      };
    }
    case 'UpdateConnectivityAction': {
      const { connectivity } = action;
      if ('connectivity' in previousState) {
        return {
          ...previousState,
          connectivity,
        };
      } else {
        return withNewReport(
          previousState,
          incorrectTransitionError(previousState)
        );
      }
    }
    case 'AddReportAction': {
      return withNewReport(previousState, action.report);
    }
    case 'RemoveReportAction': {
      const previousReports = previousState.reports || [];
      previousReports.splice(action.index, 1);
      return {
        ...previousState,
        reports: [...previousReports],
      };
    }
    case 'AddFinalizedBlockAction': {
      const { endpoints, block, chain } = action;
      if (previousState.type == 'ConnectedState') {
        // Already connected, update connectivity
        // But do not update chain details
        return {
          ...previousState,
          connectivity: { type: 'Following', endpoints },
          block: previousState.block,
          chain: previousState.chain,
        };
      } else if (previousState.type == 'RestoredState') {
        // First block received
        return {
          ...previousState,
          type: 'ConnectedState',
          block,
          chain,
          details: new Map(),
        };
      } else {
        return withNewReport(
          previousState,
          incorrectTransitionError(previousState)
        );
      }
    }
    case 'StoreReferendumDetailsAction': {
      const { details } = action;
      const previousDetails = previousState.details;

      return {
        ...previousState,
        details: new Map([...previousDetails, ...details]),
      };
    }
    case 'CastVoteAction':
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
          incorrectTransitionError(previousState)
        );
      }
    case 'ClearVotesAction':
      if ('votes' in previousState) {
        return {
          ...previousState,
          votes: new Map(),
        };
      } else {
        return withNewReport(
          previousState,
          incorrectTransitionError(previousState)
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
  return {
    votes,
  };
}

export async function fetchChainState(
  api: {
    consts: QueryableConsts<'promise'>;
    query: QueryableStorage<'promise'>;
  },
  connectedAccount?: Address
): Promise<ChainState> {
  const tracks = getAllTracks(api);
  const referenda = await getAllReferenda(api);
  const fellows = await getAllMembers(api);
  const allVotings = new Map<Address, Map<number, Voting>>();
  if (connectedAccount) {
    allVotings.set(connectedAccount, await getVotingFor(api, connectedAccount));
  }
  return { tracks, referenda, allVotings, fellows };
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
      await this.addReport({ type: 'Error', message: e.toString() });
    }
  }

  stop() {
    this.unsub?.();
  }

  async castVote(index: number, vote: AccountVote) {
    this.#dispatch({
      type: 'CastVoteAction',
      index,
      vote,
    });

    // Persist votes before they are broadcasted on chain
    const state = this.#stateAccessor();
    if (state.type == 'ConnectedState') {
      const db = await DB_CACHE.getOrCreate(dbNameFor(state.network));
      await save(db, VOTE_STORE_NAME, index, vote);
    } else {
      await this.addReport(incorrectTransitionError(state));
    }
  }

  async signAndSendVotes(
    { account, signer }: SigningAccount,
    accountVotes: Map<number, AccountVote>
  ) {
    const state = this.#stateAccessor();
    if (
      state.type == 'ConnectedState' &&
      state.connectivity.type == 'Connected'
    ) {
      const db = await DB_CACHE.getOrCreate(dbNameFor(state.network));
      const api = await API_CACHE.getOrCreate(state.connectivity.endpoints);
      await submitBatchVotes(api, account.address, signer, accountVotes);

      // Clear user votes
      await clear(db, VOTE_STORE_NAME);

      this.#dispatch({
        type: 'ClearVotesAction',
      });
    } else {
      await this.addReport(incorrectTransitionError(state));
    }
  }

  async subscribeToDelegates(
    address: string,
    tracks: number[],
    cb: (delegations: any) => void
  ) {
    const state = this.#stateAccessor();
    let unsub;
    if (
      state.type == 'ConnectedState' &&
      (state.connectivity.type == 'Connected' ||
        state.connectivity.type == 'Following')
    ) {
      const api = await API_CACHE.getOrCreate(state.connectivity.endpoints);
      const args = tracks.map((track) => [address, track]);

      unsub = await api.query.convictionVoting.votingFor.multi(
        args,
        (votings) => {
          const delegations = votings.map((voting, idx) => ({
            track: args[idx][1],
            delegating: voting?.isDelegating ? voting.asDelegating : undefined,
          }));
          cb(delegations);
        }
      );
    } else {
      console.log(state);
      await this.addReport(incorrectTransitionError(state));
    }
    return unsub;
  }

  async setConnectedAccount(connectedAccount: Address) {
    this.#dispatch({
      type: 'SetConnectedAccountAction',
      connectedAccount,
    });
  }

  async addReport(report: Report) {
    this.#dispatch({
      type: 'AddReportAction',
      report,
    });
  }

  async removeReport(index: number) {
    this.#dispatch({
      type: 'RemoveReportAction',
      index,
    });
  }
}

const DEFAULT_INITIAL_STATE: State = {
  type: 'InitialState',
  connectivity: { type: navigator.onLine ? 'Online' : 'Offline' },
  connectedAccount: null,
  details: new Map(),
  indexes: {},
  delegates: [],
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

export function useLifeCycle(
  initialState: State = DEFAULT_INITIAL_STATE
): [State, Updater] {
  const [state, dispatch] = useReducer(
    useReducerWithHistory(reducer, history),
    initialState
  );
  const lastState = useRef(state);
  useEffect(() => {
    lastState.current = state;
  }, [state]);
  // Allows to access current State
  const stateAccessor = useCallback(() => lastState.current, []);
  const updater = new Updater(stateAccessor, dispatch);

  useEffect(() => {
    async function start() {
      await updater.start();
    }

    start();

    return () => {
      updater.stop();
    };
  }, []);

  return [state, updater];
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
  dispatch: Dispatch<Action>,
  network: Network,
  rpcParam: string | null
): Promise<VoidFunction | undefined> {
  const db = await open(dbNameFor(network), STORES, DB_VERSION);
  const { votes } = await measured('fetch-restored-state', () =>
    restorePersisted(db)
  );
  dispatch({
    type: 'SetRestoredAction',
    network,
    votes,
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

  return dispatchEndpointsParamChange(dispatch, network, rpcParam);
}

function dispatchAddReport(dispatch: Dispatch<Action>, report: Report) {
  dispatch({
    type: 'AddReportAction',
    report,
  });
}

async function dispatchEndpointsParamChange(
  dispatch: Dispatch<Action>,
  network: Network,
  rpcParam: string | null
): Promise<VoidFunction | undefined> {
  if (rpcParam) {
    const endpoints = extractEndpointsFromParam(rpcParam);
    if (endpoints.type == 'ok') {
      return await dispatchEndpointsChange(dispatch, endpoints.value);
    } else {
      dispatchAddReport(dispatch, {
        type: 'Error',
        message: `Invalid 'rpc' param ${rpcParam}: ${endpoints.error}`,
      });
    }
  } else {
    return await dispatchEndpointsChange(dispatch, endpointsFor(network));
  }
}

async function dispatchEndpointsChange(
  dispatch: Dispatch<Action>,
  endpoints: string[]
): Promise<VoidFunction> {
  dispatch({
    type: 'UpdateConnectivityAction',
    connectivity: { type: 'Connected', endpoints },
  });

  const api = await API_CACHE.getOrCreate(endpoints);
  return await api.rpc.chain.subscribeFinalizedHeads(async (header) => {
    const apiAt = await api.at(header.hash);
    // TODO rely on subs, do not re-fetch whole state each block
    const chain = await measured('fetch-chain-state', () =>
      fetchChainState(apiAt)
    );
    dispatch({
      type: 'AddFinalizedBlockAction',
      endpoints,
      block: header.number.toNumber(),
      chain,
    });
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
        dispatchAddReport(dispatch, {
          type: 'Error',
          message: `Both rpc and network params can't be set at the same time`,
        });
      } else {
        if (networkParam) {
          // `network` param is set and takes precedence, `endpoints` might
          const network = parse(networkParam);
          if (network.type == 'ok') {
            if (state.network != network.value) {
              // Only react to network changes
              updateUnsub(
                await dispatchNetworkChange(dispatch, network.value, rpcParam)
              );
            }
          } else {
            dispatchAddReport(dispatch, {
              type: 'Error',
              message: `Invalid 'network' param ${networkParam}: ${network.error}`,
            });
          }
        } else if (rpcParam) {
          // Only `rpc` param is set, reconnect using those
          updateUnsub(
            await dispatchEndpointsParamChange(
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
      type: 'UpdateConnectivityAction',
      connectivity: { type: 'Online' },
    });
  });

  window.addEventListener('offline', () =>
    dispatch({
      type: 'UpdateConnectivityAction',
      connectivity: { type: 'Offline' },
    })
  );

  window.addEventListener('unhandledrejection', (event) =>
    dispatchAddReport(dispatch, {
      type: 'Error',
      message: `Unhandled promise rejection for ${event.promise}: ${event.reason}`,
    })
  );

  function getNetwork(networkParam: string | null): Result<Network> {
    if (networkParam) {
      const network = parse(networkParam);
      if (network.type == 'ok') {
        return ok(network.value);
      } else {
        return network;
      }
    } else {
      return ok(DEFAULT_NETWORK);
    }
  }

  const { networkParam, rpcParam } = currentParams();
  const network = getNetwork(networkParam);
  if (network.type == 'ok') {
    updateUnsub(await dispatchNetworkChange(dispatch, network.value, rpcParam));
  } else {
    dispatchAddReport(dispatch, {
      type: 'Error',
      message: network.error.message,
    });
  }

  return () => {
    console.log('Unsub');
    currentUnsub?.();
  };
}

export * from './types';
