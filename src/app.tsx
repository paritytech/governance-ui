import React, { MouseEventHandler, Suspense, useEffect, useState } from 'react';
import {
  Button,
  CloseSquareIcon,
  HeartIcon,
  Loading,
  Spacer,
  Text,
} from './components/common';
import { ReferendumDeck, VotesTable } from './components';
import { ReferendumOngoing, Track, Vote, VoteType } from './types';
import { timeout } from './utils/promise';
import { getAllReferenda, getAllTracks } from './chain/referenda';
import { ApiPromise } from '@polkadot/api';
import { useApi } from './contexts/Api';
import styles from '../assets/css/app.module.css';

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
    <div className={styles.actions}>
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

function Main({
  tracks,
  referenda,
  voteOn,
}: {
  tracks: Map<number, Track>;
  referenda: Map<number, ReferendumOngoing>;
  voteOn: (index: number, vote: VoteType) => void;
}): JSX.Element {
  const topReferenda: number = referenda.keys().next().value;
  const { network } = useApi();
  return (
    <Suspense fallback={<LoadingScreen />}>
      <div className={styles.main}>
        <ReferendumDeck
          network={network}
          tracks={tracks}
          referenda={referenda}
          voteOn={voteOn}
        />
      </div>
      <ActionBar
        left={referenda.size}
        onAccept={() => voteOn(topReferenda, VoteType.Aye)}
        onRefuse={() => voteOn(topReferenda, VoteType.Nay)}
      />
      <Spacer y={1} />
    </Suspense>
  );
}

function App(): JSX.Element {
  const [tracks, setTracks] = useState<Map<number, Track>>(new Map());
  const [referenda, setReferenda] = useState<Map<number, ReferendumOngoing>>(
    new Map()
  );
  const [error, setError] = useState<string>();
  const [votes, setVotes] = useState<Array<Vote>>([]);
  const { api } = useApi();
  useEffect(() => {
    async function fetchData(api: ApiPromise) {
      setTracks(getAllTracks(api));

      // Retrieve all referenda, then display them
      await timeout(getAllReferenda(api), FETCH_DATA_TIMEOUT)
        .then((referenda) => {
          const ongoingdReferenda = new Map(
            [...referenda].filter(([, v]) => v.type == 'ongoing') as [
              number,
              ReferendumOngoing
            ][]
          );
          setReferenda(ongoingdReferenda);
        })
        .catch((e) => {
          console.error(`Failed to fetch referenda: ${e}`);
          setError('Failed to fetch data in time');
        });
    }
    api && fetchData(api);
  }, [api]);

  function voteOn(index: number, vote: VoteType) {
    setVotes([...votes, { vote, index }]);
    if (!referenda?.delete(index)) {
      console.error(`Failed to remove referenda ${index}`);
    }
    setReferenda(new Map([...referenda]));
  }

  return (
    <div className={styles.app}>
      {referenda?.size == 0 && votes?.length != 0 ? (
        <VotesTable votes={votes} />
      ) : (
        <Main voteOn={voteOn} tracks={tracks} referenda={referenda} />
      )}
      {error && <div>{error}</div>}
    </div>
  );
}

export default App;
