import React, { MouseEventHandler, Suspense, useEffect, useState } from 'react';
import {
  Button,
  CloseSquareIcon,
  HeartIcon,
  Loading,
  Spacer,
  SwipeableCard,
  Text,
} from './components/common';
import { ReferendumCard, VotesTable } from './components';
import useSearchParam from './hooks/useSearchParam';
import { Referendum, ReferendumOngoing, Track, Vote, VoteType } from './types';
import { endpointFor, Network, newApi } from './utils/polkadot-api';
import { timeout } from './utils/promise';
import { getAllReferenda, getAllTracks } from './chain/referenda';

const FETCH_DATA_TIMEOUT = 15000; // in milliseconds

function LoadingScreen(): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
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
  onAccept,
  onRefuse,
}: {
  onAccept: MouseEventHandler<HTMLButtonElement>;
  onRefuse: MouseEventHandler<HTMLButtonElement>;
}): JSX.Element {
  return (
    <div style={{ display: 'flex' }}>
      <Button
        color="success"
        onPress={onAccept}
        icon={<HeartIcon primaryColor="currentColor" filled />}
      />
      <Spacer x={2} />
      <Button
        color="error"
        onPress={onRefuse}
        icon={
          <CloseSquareIcon set="light" primaryColor="currentColor" filled />
        }
      />
    </div>
  );
}

function Main({
  network,
  tracks,
  referenda,
  voteOn,
}: {
  network: Network;
  tracks: Map<number, Track>;
  referenda: Map<number, ReferendumOngoing>;
  voteOn: (index: number, vote: VoteType) => void;
}): JSX.Element {
  let topReferenda = 0;
  return (
    <Suspense fallback={<LoadingScreen />}>
      <div
        style={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {Array.from(referenda.entries()).map(([index, referendum]) => {
          topReferenda = index;
          return (
            <SwipeableCard
              key={index}
              onVote={(vote: VoteType) => voteOn(index, vote)}
              drag={true}
            >
              <ReferendumCard
                network={network}
                index={index}
                tracks={tracks}
                referendum={referendum}
              />
            </SwipeableCard>
          );
        })}
      </div>
      <ActionBar
        onAccept={() => voteOn(topReferenda, VoteType.Aye)}
        onRefuse={() => voteOn(topReferenda, VoteType.Nay)}
      />
      <Spacer y={1} />
      <Text>{referenda.size} left</Text>
      <Spacer y={1} />
    </Suspense>
  );
}

function App(): JSX.Element {
  const networkParam = useSearchParam('network');
  const rpcParam = useSearchParam('rpc');
  const network = Network.parse(networkParam);
  const [tracks, setTracks] = useState<Map<number, Track>>(new Map());
  const [referenda, setReferenda] = useState<Map<number, ReferendumOngoing>>(
    new Map()
  );
  const [error, setError] = useState<string>();
  const [votes, setVotes] = useState<Array<Vote>>([]);

  useEffect(() => {
    async function fetchData() {
      const api = await newApi(rpcParam ? rpcParam : endpointFor(network));
      if (rpcParam) {
        // Check that provided rpc and network point to a same logical chain
        const connectedChain = api.runtimeChain.toHuman() as Network;
        if (connectedChain != network) {
          console.error(
            `Provided RPC doesn't match network ${network}: ${rpcParam}`
          );
        } else {
          console.info(`Connected to network ${network} using RPC ${rpcParam}`);
        }
      } else {
        console.info(`Connected to network ${network.toString()}`);
      }

      setTracks(getAllTracks(api));

      // Retrieve all referenda, then display them
      await timeout(getAllReferenda(api), FETCH_DATA_TIMEOUT)
        .then((referenda) => {
          const ongoingdReferenda = new Map(
            [...referenda].filter(([_k, v]) => v.type == 'ongoing') as [
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
    fetchData();
  }, []);

  function voteOn(index: number, vote: VoteType) {
    setVotes([...votes, { vote, index }]);
    referenda?.delete(index);
    setReferenda(new Map([...referenda]));
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        {referenda?.size == 0 && votes?.length != 0 ? (
          <VotesTable votes={votes} />
        ) : (
          <Main
            voteOn={voteOn}
            network={network}
            tracks={tracks}
            referenda={referenda}
          />
        )}
        {error && <div>{error}</div>}
      </div>
    </>
  );
}

export default App;
