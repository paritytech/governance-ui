import { Dispatch, useEffect, useReducer } from 'react';
import { QueryableConsts, QueryableStorage } from '@polkadot/api/types';
import { getVotingFor } from '../chain/conviction-voting';
import { getAllReferenda, getAllTracks } from '../chain/referenda';
import {
  DEFAULT_NETWORK,
  endpointsFor,
  Network,
  networkFor,
  parse,
} from '../network';
import { AccountVote, Referendum, ReferendumOngoing, Voting } from '../types';
import { err, ok, Result } from '../utils';
import { dbNameFor, DB_VERSION, STORES, VOTE_STORE_NAME } from '../utils/db';
import { all, open, save } from '../utils/indexeddb';
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
  console.debug(`Applying ${action.type} to state ${previousState.type}`);
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
      const { db, network, votes } = action;
      return {
        ...previousState,
        type: 'RestoredState',
        db,
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
      const { api, endpoints, block, chain } = action;
      if (previousState.type == 'ConnectedState') {
        // Already connected, update connectivity
        // But do not update chain details
        return {
          ...previousState,
          connectivity: { type: 'Following', api, endpoints },
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
      if ('details' in previousState) {
        const previousDetails = previousState.details;
        return {
          ...previousState,
          details: new Map([...previousDetails, ...details]),
        };
      } else {
        return withNewReport(
          previousState,
          incorrectTransitionError(previousState)
        );
      }
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

export class Updater {
  readonly #state;
  readonly #dispatch;

  constructor(state: State, dispatch: Dispatch<Action>) {
    this.#state = state;
    this.#dispatch = dispatch;
  }

  async start() {
    await updateChainState(this.#state, this.#dispatch);
  }

  async castVote(index: number, vote: AccountVote) {
    this.#dispatch({
      type: 'CastVoteAction',
      index,
      vote,
    });

    // Persist votes before they are broadcasted on chain
    if (this.#state.type == 'ConnectedState') {
      await save(this.#state.db, VOTE_STORE_NAME, index, vote);
    } else {
      await this.newReport(incorrectTransitionError(this.#state));
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

// When needs to dif data
// https://news.ycombinator.com/item?id=29130661
// https://dev.to/asyncbanana/building-the-fastest-object-and-array-differ-2l6f
// https://github.com/AsyncBanana/microdiff

// https://polkadot.js.org/docs/api/start/api.query.subs/

const DEFAULT_INITIAL_STATE: State = {
  type: 'InitialState',
  connectivity: { type: navigator.onLine ? 'Online' : 'Offline' },
  connectedAccount: null,
};

export function useLifeCycle(
  initialState: State = DEFAULT_INITIAL_STATE
): [State, Updater] {
  const [state, dispatch] = useReducer(reducer, initialState);
  const updater = new Updater(state, dispatch);

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
    db,
    network,
    votes,
  });

  dispatchEndpointsParamChange(dispatch, network, rpcParam);
}

function dispatchNewReport(dispatch: Dispatch<Action>, report: Report) {
  dispatch({
    type: 'NewReportAction',
    report,
  });
}

async function dispatchEndpointsParamChange(
  dispatch: Dispatch<Action>,
  network: Network,
  rpcParam: string | null
) {
  if (rpcParam) {
    const endpoints = extractEndpointsFromParam(rpcParam);
    if (endpoints.type == 'ok') {
      await dispatchEndpointsChange(dispatch, network, endpoints.value);
    } else {
      dispatchNewReport(dispatch, {
        type: 'Error',
        message: `Invalid 'rpc' param ${rpcParam}: ${endpoints.error}`,
      });
    }
  } else {
    await dispatchEndpointsChange(dispatch, network, endpointsFor(network));
  }
}

async function loadAndDispatchReferendaDetails(
  dispatch: Dispatch<Action>,
  referenda: Map<number, Referendum>,
  network: Network
) {
  const indexes = Array.from(referenda.keys());
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
  dispatch: Dispatch<Action>,
  network: Network,
  endpoints: string[]
) {
  const api = await measured('api', () => newApi(endpoints));
  //  api.on('disconnected', () => console.log('api', 'disconnected'));
  //  api.on('connected', () => console.log('api', 'connected'));
  //  api.on('error', (error) => console.log('api', 'error', error));

  dispatch({
    type: 'UpdateConnectivityAction',
    connectivity: { type: 'Connected', api, endpoints },
  });

  return await api.rpc.chain.subscribeFinalizedHeads(async (header) => {
    const apiAt = await api.at(header.hash);
    const chain = await measured('fetch-chain-state', () =>
      fetchChainState(apiAt)
    );
    dispatch({
      type: 'NewFinalizedBlockAction',
      api,
      endpoints,
      block: header.number.toNumber(),
      chain,
    });

    await loadAndDispatchReferendaDetails(dispatch, chain.referenda, network);
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

export async function updateChainState(
  state: State,
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
              await dispatchNetworkChange(dispatch, network.value, rpcParam);
            }
          } else {
            dispatchNewReport(dispatch, {
              type: 'Error',
              message: `Invalid 'network' param ${networkParam}: ${network.error}`,
            });
          }
        } else if (rpcParam) {
          // Only `rpc` param is set, reconnect using those
          dispatchEndpointsParamChange(dispatch, state.network, rpcParam);
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

  const { networkParam, rpcParam } = currentParams();
  if (networkParam) {
    const network = parse(networkParam);
    if (network.type == 'ok') {
      await dispatchNetworkChange(dispatch, network.value, rpcParam);
    } else {
      dispatchNewReport(dispatch, {
        type: 'Error',
        message: network.error.message,
      });
    }
  } else {
    await dispatchNetworkChange(dispatch, DEFAULT_NETWORK, rpcParam);
  }
}
