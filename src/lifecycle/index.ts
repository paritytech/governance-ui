import { Dispatch, useCallback, useEffect, useReducer, useRef } from 'react';
import { ApiPromise } from '@polkadot/api';
import { QueryableConsts, QueryableStorage } from '@polkadot/api/types';
import { getVotingFor, submitBatchVotes } from '../chain/conviction-voting';
import { getAllReferenda, getAllTracks } from '../chain/referenda';
import { SigningAccount } from '../contexts';
import { DEFAULT_NETWORK, endpointsFor, Network, parse } from '../network';
import { AccountVote, Referendum, ReferendumOngoing, Voting } from '../types';
import { err, ok, Result } from '../utils';
import { Cache, Readyable } from '../utils/cache';
import { dbNameFor, DB_VERSION, STORES, VOTE_STORE_NAME } from '../utils/db';
import { all, clear, open, save } from '../utils/indexeddb';
import { measured } from '../utils/performance';
import { newApi } from '../utils/polkadot-api';
import { fetchReferenda } from '../utils/polkassembly';
import { extractSearchParams } from '../utils/search-params';
import {
  Action,
  Address,
  ChainState,
  PersistedDataContext,
  Report,
  State,
} from './types';

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
    case 'NewReportAction': {
      console.error(action.report);
      return withNewReport(previousState, action.report);
    }
    case 'NewFinalizedBlockAction': {
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
  const allVotings = new Map<Address, Map<number, Voting>>();
  if (connectedAccount) {
    allVotings.set(connectedAccount, await getVotingFor(api, connectedAccount));
  }
  return { tracks, referenda, allVotings };
}

class DBReady implements Readyable<IDBDatabase> {
  ready: Promise<IDBDatabase>;
  constructor(name: string) {
    this.ready = open(name, STORES, DB_VERSION);
  }
}

class ApiReady implements Readyable<ApiPromise> {
  ready: Promise<ApiPromise>;
  constructor(endpoints: string[]) {
    this.ready = measured(
      'api',
      async () => (await newApi(endpoints)).isReadyOrError
    );
  }
}

const DB_CACHE = new Cache(DBReady);
const API_CACHE = new Cache(ApiReady);

export class Updater {
  readonly #stateAccessor;
  readonly #dispatch;

  constructor(stateAccessor: () => State, dispatch: Dispatch<Action>) {
    this.#stateAccessor = stateAccessor;
    this.#dispatch = dispatch;
  }

  async start() {
    await updateChainState(this.#stateAccessor, this.#dispatch);
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
      await this.newReport(incorrectTransitionError(state));
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
      await this.newReport(incorrectTransitionError(state));
    }
  }

  async setConnectedAccount(connectedAccount: Address) {
    this.#dispatch({
      type: 'SetConnectedAccountAction',
      connectedAccount,
    });
  }

  async newReport(report: Report) {
    this.#dispatch({
      type: 'NewReportAction',
      report,
    });
  }
}

const DEFAULT_INITIAL_STATE: State = {
  type: 'InitialState',
  connectivity: { type: navigator.onLine ? 'Online' : 'Offline' },
  connectedAccount: null,
  details: new Map(),
};

type Reducer = (previousState: State, action: Action) => State;

function useReducerLogger(reducer: Reducer): Reducer {
  return useCallback(
    (previousState: State, action: Action) => {
      console.debug(`Applying ${action.type} to state ${previousState.type}`);
      const newState = reducer(previousState, action);
      console.debug(`New state: ${newState.type}`);
      return newState;
    },
    [reducer]
  );
}

export function useLifeCycle(
  initialState: State = DEFAULT_INITIAL_STATE
): [State, Updater] {
  const [state, dispatch] = useReducer(useReducerLogger(reducer), initialState);
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
  }, []);

  return [state, updater];
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
) {
  const db = await open(dbNameFor(network), STORES, DB_VERSION);
  const { votes } = await measured('fetch-restored-state', () =>
    restorePersisted(db)
  );
  dispatch({
    type: 'SetRestoredAction',
    network,
    votes,
  });

  dispatchEndpointsParamChange(stateAccessor, dispatch, network, rpcParam);
}

function dispatchNewReport(dispatch: Dispatch<Action>, report: Report) {
  dispatch({
    type: 'NewReportAction',
    report,
  });
}

async function dispatchEndpointsParamChange(
  stateAccessor: () => State,
  dispatch: Dispatch<Action>,
  network: Network,
  rpcParam: string | null
) {
  if (rpcParam) {
    const endpoints = extractEndpointsFromParam(rpcParam);
    if (endpoints.type == 'ok') {
      await dispatchEndpointsChange(
        stateAccessor,
        dispatch,
        network,
        endpoints.value
      );
    } else {
      dispatchNewReport(dispatch, {
        type: 'Error',
        message: `Invalid 'rpc' param ${rpcParam}: ${endpoints.error}`,
      });
    }
  } else {
    await dispatchEndpointsChange(
      stateAccessor,
      dispatch,
      network,
      endpointsFor(network)
    );
  }
}

async function loadAndDispatchReferendaDetails(
  dispatch: Dispatch<Action>,
  referendaIndexes: Array<number>,
  network: Network
) {
  const indexes = Array.from(referendaIndexes);
  indexes.forEach(async (index) => {
    const details = await measured('fetch-referenda', () =>
      fetchReferenda(network, index)
    );
    dispatch({
      type: 'StoreReferendumDetailsAction',
      details: new Map([[index, details]]),
    });
  });
}

async function dispatchEndpointsChange(
  stateAccessor: () => State,
  dispatch: Dispatch<Action>,
  network: Network,
  endpoints: string[]
) {
  dispatch({
    type: 'UpdateConnectivityAction',
    connectivity: { type: 'Connected', endpoints },
  });

  const api = await API_CACHE.getOrCreate(endpoints);
  return await api.rpc.chain.subscribeFinalizedHeads(async (header) => {
    const apiAt = await api.at(header.hash);
    const chain = await measured('fetch-chain-state', () =>
      fetchChainState(apiAt)
    );
    dispatch({
      type: 'NewFinalizedBlockAction',
      endpoints,
      block: header.number.toNumber(),
      chain,
    });

    // Trigger load of details for new referenda
    const state = stateAccessor();
    const previousReferendaIndexes = Array.from(state.details.keys());
    const newReferendaIndexes = Array.from(
      filterOngoingReferenda(chain.referenda).keys()
    );
    const missingReferendaIndexes = newReferendaIndexes.filter(
      (index) => !previousReferendaIndexes.includes(index)
    );
    await loadAndDispatchReferendaDetails(
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
) {
  // First setup listeners

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
        dispatchNewReport(dispatch, {
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
              await dispatchNetworkChange(
                stateAccessor,
                dispatch,
                network.value,
                rpcParam
              );
            }
          } else {
            dispatchNewReport(dispatch, {
              type: 'Error',
              message: `Invalid 'network' param ${networkParam}: ${network.error}`,
            });
          }
        } else if (rpcParam) {
          // Only `rpc` param is set, reconnect using those
          dispatchEndpointsParamChange(
            stateAccessor,
            dispatch,
            state.network,
            rpcParam
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
    dispatchNewReport(dispatch, {
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
    await dispatchNetworkChange(
      stateAccessor,
      dispatch,
      network.value,
      rpcParam
    );
  } else {
    dispatchNewReport(dispatch, {
      type: 'Error',
      message: network.error.message,
    });
  }
}
