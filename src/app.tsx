import React, { MouseEventHandler, useEffect, useState } from 'react';
import { ApiPromise } from '@polkadot/api';
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
import { useApi } from './contexts/Api';
import { ReferendumOngoing, Track, Vote } from './types';
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
  voteOn: (index: number, vote: Vote) => void;
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
          onAccept={() => topReferenda && voteOn(topReferenda, Vote.Aye)}
          onRefuse={() => topReferenda && voteOn(topReferenda, Vote.Nay)}
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
  votes: Map<number, Vote>;
};

export type StateContext = { state: State.LOADING } | StartedContext;

function voteOn(
  index: number,
  vote: Vote,
  setStateContext: React.Dispatch<React.SetStateAction<StartedContext>>
) {
  setStateContext((stateContext) => {
    stateContext.votes.set(index, vote);
    return { ...stateContext }; // Copy object to trigger re-draw
  });
}

function AppPanel({
  context,
  voteHandler,
}: {
  context: StateContext;
  voteHandler: (index: number, vote: Vote) => void;
}): JSX.Element {
  const { state } = context;
  switch (state) {
    case State.LOADING:
      return <LoadingScreen />;
    case State.STARTED: {
      const { referenda, tracks, votes } = context;
      const referendumKeys = new Set(referenda.keys());
      const voteKeys = new Set(votes.keys());
      if (
        referendumKeys.size > 0 &&
        referendumKeys.size == voteKeys.size &&
        [...referendumKeys].every((x) => voteKeys.has(x))
      ) {
        // Sets equality consider insertion order
        // There are some referenda to vote on left
        return <VotesTable votes={votes} />;
      } else {
        // Let user vote on referenda
        // Only consider referenda that have not be voted on yet
        const referendaToBeVotedOn: [number, ReferendumOngoing][] = [
          ...referenda,
        ].filter(([index]) => !votes.has(index));
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

  useEffect(() => {
    async function fetchData(api: ApiPromise) {
      const tracks = getAllTracks(api);

      // Retrieve all referenda, then display them
      await timeout(getAllReferenda(api), FETCH_DATA_TIMEOUT)
        .then((allReferenda) => {
          // Only consider 'ongoing' referendum
          const referenda = new Map(
            [...allReferenda]
              .filter(([, v]) => v.type == 'ongoing')
              .map(([index, referendum]) => [index, referendum]) as [
              number,
              ReferendumOngoing
            ][]
          );
          setStateContext({
            state: State.STARTED,
            tracks,
            referenda,
            votes: new Map(),
          });
        })
        .catch((e) => {
          console.error(`Failed to fetch referenda: ${e}`);
          setError('Failed to fetch data in time');
        });
    }
    api && fetchData(api);
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
