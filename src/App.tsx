import React, { useEffect, useState } from 'react';
import { ApiPromise } from '@polkadot/api';
import { getVotingFor } from './chain/conviction-voting';
import { getAllReferenda, getAllTracks } from './chain/referenda';
import { LoadingPanel, VotesTable, VotingPanel } from './components';
import { SigningAccount, useAccount, useApi } from './contexts';
import { AccountVote, ReferendumOngoing, Track } from './types';
import { measured } from './utils/performance';
import { timeout } from './utils/promise';
import { areEquals } from './utils/set';
import { Store, Stores } from './utils/store';

const FETCH_DATA_TIMEOUT = 15000; // in milliseconds

enum State {
  LOADING,
  STARTED,
}

type StartedContext = {
  state: State.STARTED;
  tracks: Map<number, Track>;
  referenda: Map<number, ReferendumOngoing>;
  accountVotes: Map<number, AccountVote>;
};

export type StateContext = { state: State.LOADING } | StartedContext;

function voteOn(
  index: number,
  vote: AccountVote,
  setStateContext: React.Dispatch<React.SetStateAction<StartedContext>>
) {
  setStateContext((stateContext) => {
    stateContext.accountVotes.set(index, vote);
    return { ...stateContext }; // Copy object to trigger re-draw
  });
}

function AppPanel({
  api,
  connectedAccount,
  context,
  voteHandler,
}: {
  api: ApiPromise;
  connectedAccount: SigningAccount | undefined;
  context: StateContext;
  voteHandler: (index: number, accountVote: AccountVote) => void;
}): JSX.Element {
  const { state } = context;
  switch (state) {
    case State.LOADING:
      return <LoadingPanel message="Get ready to vote!" />;
    case State.STARTED: {
      const { referenda, tracks, accountVotes } = context;
      const referendumKeys = new Set(referenda.keys());
      const voteKeys = new Set(accountVotes.keys());
      if (referendumKeys.size > 0 && areEquals(referendumKeys, voteKeys)) {
        // There are some referenda to vote on left
        return (
          <VotesTable
            api={api}
            connectedAccount={connectedAccount}
            accountVotes={accountVotes}
          />
        );
      } else {
        // Let user vote on referenda
        // Only consider referenda that have not be voted on yet by user (both on-chain and in local state)
        const referendaToBeVotedOn: [number, ReferendumOngoing][] = [
          ...referenda,
        ].filter(([index]) => !accountVotes.has(index));
        return (
          <VotingPanel
            api={api}
            voteHandler={voteHandler}
            tracks={tracks}
            referenda={referendaToBeVotedOn}
          />
        );
      }
    }
  }
}

function ConnectedApp({ api }: { api: ApiPromise }): JSX.Element {
  const [error, setError] = useState<string>();
  const [stateContext, setStateContext] = useState<StateContext>({
    state: State.LOADING,
  });
  const { connectedAccount } = useAccount();

  useEffect(() => {
    async function fetchData(api: ApiPromise) {
      // Although tracks can theoretically be updated via a chain upgrade, they will be considered static
      const tracks = getAllTracks(api);

      // Retrieve all referenda, then display them
      const allReferenda = await measured('allReferenda', () =>
        timeout(getAllReferenda(api), FETCH_DATA_TIMEOUT)
      );

      // Only consider 'ongoing' referendum
      const referenda = new Map(
        [...allReferenda]
          .filter(([, v]) => v.type == 'ongoing')
          .map(([index, referendum]) => [index, referendum]) as [
          number,
          ReferendumOngoing
        ][]
      );

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

      setStateContext({
        state: State.STARTED,
        tracks,
        referenda,
        accountVotes,
      });
    }

    try {
      api && fetchData(api);
    } catch (e) {
      console.error(`Failed to fetch referenda: ${e}`);
      setError('Failed to fetch data in time');
    }
  }, [api]);

  return (
    <div className="flex flex-auto flex-col items-center justify-center">
      {api === null ? (
        <div>Failed to connect to the chain</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <AppPanel
          api={api}
          connectedAccount={connectedAccount}
          context={stateContext}
          voteHandler={async (index, vote) => {
            // Store user votes
            const accountVotesStore = await Store.storeFor<AccountVote>(
              Stores.AccountVote
            );
            await accountVotesStore.save(index, vote);

            voteOn(
              index,
              vote,
              setStateContext as React.Dispatch<
                React.SetStateAction<StartedContext>
              >
            );
          }}
        />
      )}
    </div>
  );
}

function App(): JSX.Element {
  const { api } = useApi();
  if (api) {
    return <ConnectedApp api={api} />;
  }
  return <></>;
}

export default App;
