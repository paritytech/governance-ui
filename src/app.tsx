import React, { MouseEventHandler, useEffect, useState } from 'react';
import { ApiPromise } from '@polkadot/api';
import {
  createStandardAccountVote,
  getVotingFor,
} from './chain/conviction-voting';
import { getAllReferenda, getAllTracks } from './chain/referenda';
import {
  Button,
  CloseSquareIcon,
  HeartIcon,
  Loading,
  Spacer,
  Text,
} from './components/common';
import { ReferendaDeck, VotesTable } from './components';
import { useAccount, useApi } from './contexts';
import { AccountVote, ReferendumOngoing, Track } from './types';
import { timeout } from './utils/promise';
import styles from './app.module.css';

const FETCH_DATA_TIMEOUT = 15000; // in milliseconds

function LoadingScreen(): JSX.Element {
  return (
    <div className={styles.loading}>
      <Loading />
      <Spacer y={2} />
      <Text
        h1
        size={60}
        css={{
          textAlign: 'center',
        }}
      >
        Get ready to vote!
      </Text>
    </div>
  );
}

function ActionBar({
  left,
  onAccept,
  onRefuse,
}: {
  left: number;
  onAccept: MouseEventHandler<HTMLButtonElement>;
  onRefuse: MouseEventHandler<HTMLButtonElement>;
}): JSX.Element {
  return (
    <div className={styles.action}>
      <Button
        color="error"
        onPress={onRefuse}
        icon={
          <CloseSquareIcon set="light" primaryColor="currentColor" filled />
        }
      />
      <Spacer x={1} />
      <Text>{left} left</Text>
      <Spacer x={1} />
      <Button
        color="success"
        onPress={onAccept}
        icon={<HeartIcon primaryColor="currentColor" filled />}
      />
    </div>
  );
}

function VotingPanel({
  tracks,
  referenda,
  voteOn,
}: {
  tracks: Map<number, Track>;
  referenda: [number, ReferendumOngoing][];
  voteOn: (index: number, vote: AccountVote) => void;
}): JSX.Element {
  const { network } = useApi();
  // The referenda currently visible to the user
  const topReferenda = referenda.at(0)?.[0];
  return (
    <>
      <div className={styles.main}>
        <ReferendaDeck
          network={network}
          referenda={referenda}
          tracks={tracks}
          voteOn={voteOn}
        />
      </div>
      {referenda.length > 0 && (
        <ActionBar
          left={referenda.length}
          onAccept={() =>
            topReferenda &&
            voteOn(topReferenda, createStandardAccountVote(true))
          }
          onRefuse={() =>
            topReferenda &&
            voteOn(topReferenda, createStandardAccountVote(false))
          }
        />
      )}
    </>
  );
}

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
  context,
  voteHandler,
}: {
  context: StateContext;
  voteHandler: (index: number, accountVote: AccountVote) => void;
}): JSX.Element {
  const { state } = context;
  switch (state) {
    case State.LOADING:
      return <LoadingScreen />;
    case State.STARTED: {
      const { referenda, tracks, accountVotes } = context;
      const referendumKeys = new Set(referenda.keys());
      const voteKeys = new Set(accountVotes.keys());
      if (
        // Sets equality consider insertion order, roll on our own
        referendumKeys.size > 0 &&
        referendumKeys.size == voteKeys.size &&
        [...referendumKeys].every((x) => voteKeys.has(x))
      ) {
        // There are some referenda to vote on left
        return <VotesTable accountVotes={accountVotes} />;
      } else {
        // Let user vote on referenda
        // Only consider referenda that have not be voted on yet by user (both on-chain and in local state)
        const referendaToBeVotedOn: [number, ReferendumOngoing][] = [
          ...referenda,
        ].filter(([index]) => !accountVotes.has(index));
        return (
          <VotingPanel
            voteOn={voteHandler}
            tracks={tracks}
            referenda={referendaToBeVotedOn}
          />
        );
      }
    }
  }
}

function App(): JSX.Element {
  const [error, setError] = useState<string>();
  const [stateContext, setStateContext] = useState<StateContext>({
    state: State.LOADING,
  });
  const { api } = useApi();
  const { connectedAccount } = useAccount();

  useEffect(() => {
    async function fetchData(api: ApiPromise) {
      const tracks = getAllTracks(api);
      const accountVotes = new Map<number, AccountVote>();

      // Retrieve all referenda, then display them
      const allReferenda = await timeout(
        getAllReferenda(api),
        FETCH_DATA_TIMEOUT
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

      const currentAddress = connectedAccount?.account?.address;
      if (currentAddress) {
        // Go through user votes and restore the ones relevant to `referenda`
        const chainVotings = await getVotingFor(api, currentAddress);
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
    <div className={styles.app}>
      {error ? (
        <div>{error}</div>
      ) : (
        <AppPanel
          context={stateContext}
          voteHandler={(index, vote) =>
            voteOn(
              index,
              vote,
              setStateContext as React.Dispatch<
                React.SetStateAction<StartedContext>
              >
            )
          }
        />
      )}
    </div>
  );
}

export default App;
