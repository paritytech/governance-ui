import { Dispatch, useEffect, useReducer } from 'react';
import { ApiPromise } from '@polkadot/api';
import { QueryableConsts, QueryableStorage } from '@polkadot/api/types';
import { getAllReferenda, getAllTracks } from './chain/referenda';
import {
  addQueryParamsChangeListener,
  deriveEnpoints,
  extractParams,
} from './hooks';
import { AccountVote, Referendum, Track } from './types';
import { all, latest, open } from './utils/indexeddb';
import { measured } from './utils/performance';
import { newApi } from './utils/polkadot-api';
import { timeout } from './utils/promise';

export type ChainState = {
  tracks: Map<number, Track>;
  referenda: Map<number, Referendum>;
};

export type Context = {
  chain: ChainState;
  votes: Map<number, AccountVote>;
};

export type ChainSync = {
  block: number;
  when: Date;
};

// States

export type BaseState = {
  since: Date;
};

export type BaseRestoredState = BaseState & Context;

export type BaseConnectedState = BaseRestoredState & {
  api: ApiPromise;
};

export type InitialState = BaseState & {
  type: 'InitialState';
};

export type RestoredState = BaseRestoredState & {
  type: 'RestoredState';
};

export type OfflineState = BaseRestoredState & {
  type: 'OfflineState';
  retryCount: number;
};

export type ConnectingState = BaseRestoredState & {
  type: 'ConnectingState';
};

export type SyncedState = BaseConnectedState & {
  type: 'SyncedState';
};

export type SyncingState = BaseConnectedState & {
  type: 'SyncingState';
};

export type SyncState = SyncingState | SyncedState;

export type OnlineState = ConnectingState | SyncState;

export type State = InitialState | RestoredState | OfflineState | OnlineState;

// Actions

export type SetRestoredAction = {
  type: 'SetRestoredAction';
  chain: ChainState;
  votes: Map<number, AccountVote>;
};

export type SetOfflineAction = {
  type: 'SetOfflineAction';
};

export type SetConnectingAction = {
  type: 'SetConnectingAction';
};

export type SetSyncingAction = {
  type: 'SetSyncingAction';
  api: ApiPromise;
};

export type SetSyncedAction = {
  type: 'SetSyncedAction';
  api: ApiPromise;
  block: number;
  chain: ChainState;
};

export type CastVoteAction = {
  type: 'CastVoteAction';
  index: number;
  vote: AccountVote;
};

export type Action =
  | SetRestoredAction
  | SetOfflineAction
  | SetConnectingAction
  | SetSyncingAction
  | SetSyncedAction
  | CastVoteAction;

const initialState = {
  chain: { referenda: new Map(), tracks: new Map() },
  votes: new Map(),
};

function baseRestoredState(state: State): BaseRestoredState {
  switch (state.type) {
    // Some of those transitions do not happen; still fallback to safe values
    case 'InitialState':
      return {
        since: new Date(),
        ...initialState,
      };
    case 'ConnectingState':
    case 'OfflineState':
    case 'SyncedState':
    case 'SyncingState':
    case 'RestoredState':
      return state;
  }
}

function reducer(previousState: State, action: Action): State {
  switch (action.type) {
    case 'SetRestoredAction':
      return {
        type: 'RestoredState',
        since: new Date(),
        chain: action.chain,
        votes: action.votes,
      };
    case 'SetOfflineAction': {
      const since =
        previousState.type == 'OfflineState' ? previousState.since : new Date();
      const retryCount =
        previousState.type == 'OfflineState' ? previousState.retryCount++ : 0;
      return {
        ...baseRestoredState(previousState),
        type: 'OfflineState',
        since,
        retryCount,
      };
    }
    case 'SetConnectingAction':
      return {
        ...baseRestoredState(previousState),
        type: 'ConnectingState',
      };
    case 'SetSyncingAction':
      return {
        ...baseRestoredState(previousState),
        type: 'SyncingState',
        api: action.api,
      };
    case 'SetSyncedAction': {
      return {
        ...baseRestoredState(previousState),
        type: 'SyncedState',
        api: action.api,
        chain: action.chain,
      };
    }
    case 'CastVoteAction':
      if ('votes' in previousState) {
        const newVotes = previousState.votes;
        newVotes.set(action.index, action.vote);
        return {
          ...previousState,
          votes: newVotes,
        };
      } else {
        return previousState;
      }
  }
}

// Persisted data

const CHAINSTATE_STORE_NAME = `chain`;
export const VOTE_STORE_NAME = `votes`;
export const DB_NAME = 'polkadot/governance/kusama';
export const DB_VERSION = 1;

const STORES = [{ name: CHAINSTATE_STORE_NAME }, { name: VOTE_STORE_NAME }];

async function restorePersisted(db: IDBDatabase): Promise<Context> {
  const [chain, votes] = await Promise.all([
    latest<ChainState>(db, CHAINSTATE_STORE_NAME),
    all<AccountVote>(db, VOTE_STORE_NAME),
  ]);
  return {
    chain: chain?.value || initialState.chain,
    votes: votes as Map<number, AccountVote>,
  };
}

async function fetchChainState(api: {
  consts: QueryableConsts<'promise'>;
  query: QueryableStorage<'promise'>;
}): Promise<ChainState> {
  const tracks = getAllTracks(api);
  const referenda = await getAllReferenda(api);
  return { tracks, referenda };
}

export class Updater {
  readonly #dispatch;
  #cleaner: (() => void) | undefined = undefined;

  constructor(dispatch: Dispatch<Action>) {
    this.#dispatch = dispatch;
  }

  async start() {
    this.#cleaner = await updateChainState(this.#dispatch);
  }

  stop() {
    if (this.#cleaner) {
      this.#cleaner();
    }
  }

  async castVote(index: number, vote: AccountVote) {
    this.#dispatch({
      type: 'CastVoteAction',
      index,
      vote,
    });
    // TODO persist
  }
}

// When needs to dif data
// https://news.ycombinator.com/item?id=29130661
// https://dev.to/asyncbanana/building-the-fastest-object-and-array-differ-2l6f
// https://github.com/AsyncBanana/microdiff

// https://polkadot.js.org/docs/api/start/api.query.subs/

export function useLifeCycle(): [State, Updater] {
  const [state, dispatch] = useReducer(reducer, {
    type: 'InitialState',
    since: new Date(),
  });
  const updater = new Updater(dispatch);

  useEffect(() => {
    async function start() {
      await updater.start();
    }

    start();

    return () => updater.stop();
  }, []);

  return [state, updater];
}

async function moveToOnline(
  dispatch: Dispatch<Action>,
  endpoints: string[]
): Promise<() => void> {
  dispatch({
    type: 'SetConnectingAction',
  });

  const api = await measured('api', () => timeout(newApi(endpoints), 5000));
  //  api.on('disconnected', () => console.log('api', 'disconnected'));
  //  api.on('connected', () => console.log('api', 'connected'));
  //  api.on('error', (error) => console.log('api', 'error', error));

  dispatch({
    type: 'SetSyncingAction',
    api,
  });

  // TODO api can be undefined, and will
  const unsub = await api.rpc.chain.subscribeFinalizedHeads(async (header) => {
    const number = await api.query.system.number();
    const events = await api.query.system.events();
    const apiAt = await api.at(header.hash);
    const chain = await fetchChainState(apiAt);
    dispatch({
      type: 'SetSyncedAction',
      api,
      block: header.number.toNumber(),
      chain,
    });
  });

  // TODO also load from polkassembly and others
  // https://github.com/evan-liu/fetch-queue
  // https://github.com/jkramp/fetch-queue
  // https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide

  return unsub;
}

async function tryMoveToOnline(
  dispatch: Dispatch<Action>
): Promise<() => void> {
  const { rpc, network } = extractParams(window.location.search, [
    'rpc',
    'network',
  ]);
  const endpoints = deriveEnpoints(rpc, network);
  if (endpoints.type == 'ok') {
    return await moveToOnline(dispatch, endpoints.value);
  } else {
    // TODO Incorrect endpoints
    return () => {};
  }
}

async function moveToRestored(dispatch: Dispatch<Action>): Promise<() => void> {
  if (navigator.onLine) {
    return await tryMoveToOnline(dispatch);
  } else {
    dispatch({
      type: 'SetOfflineAction',
    });
    return () => {};
  }
}

export async function updateChainState(
  dispatch: Dispatch<Action>
): Promise<() => void> {
  //First setup listeners

  addQueryParamsChangeListener(async () => {
    // Track changes to network related query parameters
    await moveToRestored(dispatch);
    // TODO unsub
  });

  window.addEventListener('online', async () => {
    await tryMoveToOnline(dispatch);
  });

  window.addEventListener('offline', () =>
    dispatch({
      type: 'SetOfflineAction',
    })
  );

  const db = await open(DB_NAME, STORES, DB_VERSION);
  // Then restore persisted state
  try {
    const { chain, votes } = await restorePersisted(db);
    dispatch({
      type: 'SetRestoredAction',
      chain,
      votes,
    });
  } catch (e) {
    // Error while restoring
    // TODO offer user to clear out persistency and continue
  }

  // And finally keep track of chain state
  return await moveToRestored(dispatch);

  // Note that unlucky timing might lead to overstepping changes (triggered via listeners registered just above)
  // So applying changes must be indempotent
}

/*

      const accountVotes = new Map<number, AccountVote>();
      const accountVotesStore = await Store.storeFor<AccountVote>(
        Stores.AccountVote
      );

      // Retrieve all stored votes
      const storedAccountVotes = await accountVotesStore.loadAll();
      storedAccountVotes.forEach((accountVote, index) => {
        if (referenda.has(index)) {
          accountVotes.set(index, accountVote);
        }
      });

      const currentAddress = connectedAccount?.account?.address;
      if (currentAddress) {
        // Go through user votes and restore the ones relevant to `referenda`
        const chainVotings = await measured('votingFor', () =>
          getVotingFor(api, currentAddress)
        );
        chainVotings.forEach((voting) => {
          if (voting.type === 'casting') {
            voting.votes.forEach((accountVote, index) => {
              if (referenda.has(index)) {
                accountVotes.set(index, accountVote);
              }
            });
          }
        });
      }

      const measures = performance.getEntriesByType('measure');
      console.table(measures, ['name', 'duration']);

      // Only keep in the store votes updated from the chain and matching current referenda
      await accountVotesStore.clear();
      await accountVotesStore.saveAll(accountVotes);
*/
