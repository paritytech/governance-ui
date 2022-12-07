import React, { useEffect, useState } from 'react';
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
import { Referendum, Vote, VoteType } from './types';
import { endpointFor, Network, newApi } from './utils/polkadot-api';
import { timeout } from './utils/promise';
import { getAllReferenda } from './chain/referenda';

const FETCH_DATA_TIMEOUT = 15000; // in milliseconds

function App() {
  const networkParam = useSearchParam('network');
  const rpcParam = useSearchParam('rpc');
  const network = Network.parse(networkParam);
  const [referenda, setReferenda] = useState<
    Map<number, Referendum> | undefined
  >();
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

      // Retrieve all referenda, then display them
      await timeout(getAllReferenda(api), FETCH_DATA_TIMEOUT).then(referenda => setReferenda(referenda)).catch((e) => {
        console.error(`Failed to fetch referenda: ${e}`);
        setReferenda(new Map());
      });
    }
    fetchData();
  }, []);

  function voteOn(
    index: number,
    vote: VoteType,
    referendum: Referendum | undefined
  ) {
    if (referendum) {
      setVotes([...votes, { vote, index, referendum }]);
      referenda?.delete(index);
      setReferenda(referenda);
    }
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
        {referenda && referenda.size > 0 && (
          <>
            <div
              style={{
                display: 'flex',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {Array.from(referenda).map(([index, referendum]) => {
                console.log(referendum)
                return (
                  <SwipeableCard
                    key={index}
                    onVote={(vote: VoteType) => voteOn(index, vote, referendum)}
                    drag={true}
                  >
                    <ReferendumCard network={network} index={index} />
                  </SwipeableCard>
                );
              })}
            </div>
            <div style={{ display: 'flex' }}>
              <Button
                color="error"
                onPress={() => voteOn(0, VoteType.Nay, referenda.entries().next().value)}
                icon={
                  <CloseSquareIcon
                    set="light"
                    primaryColor="currentColor"
                    filled
                  />
                }
              />
              <Spacer x={2} />
              <Button
                color="success"
                onPress={() => voteOn(0, VoteType.Aye, referenda.entries().next().value)}
                icon={<HeartIcon primaryColor="currentColor" filled />}
              />
            </div>
            <Spacer y={1} />
          </>
        )}
        {referenda?.size == 0 && votes?.length != 0 && <VotesTable votes={votes} />}
        {referenda?.size == 0 && votes?.length == 0 && <div>Failed to fetch data in time</div>}
        {!referenda && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Loading />
            <Spacer y={2} />
            <Text
              h1
              size={60}
              color="#e6007a"
              css={{
                textAlign: 'center',
              }}
            >
              Get ready to vote!
            </Text>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
