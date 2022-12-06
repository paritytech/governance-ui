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
import { Referendum, Vote } from './types';
import { pop } from './utils';
import { getAllReferendums } from './chain/democracy';
import { endpointFor, Network, newApi } from './utils/polkadot-api';
import { timeout } from './utils/promise';

const FETCH_DATA_TIMEOUT = 15000; // in milliseconds

function App() {
  const networkParam = useSearchParam('network');
  const rpcParam = useSearchParam('rpc');
  const network = Network.parse(networkParam);
  const [referendums, setReferendums] = useState<
    Array<Referendum> | undefined
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

      // Retrieve all referendums, then display them
      console.log("Get referendum")
      await timeout(getAllReferendums(api), FETCH_DATA_TIMEOUT).then(referendums => setReferendums(referendums)).catch(() => setReferendums([]));
    }
    fetchData();
  }, []);

  function voteOn(
    idx: number,
    vote: boolean,
    referendum: Referendum | undefined
  ) {
    if (referendum) {
      setVotes([...votes, { index: idx, vote: vote, referendum: referendum }]);
      setReferendums(referendums && pop(referendums));
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
        {referendums && referendums.length > 0 && (
          <>
            <div
              style={{
                display: 'flex',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {referendums.map((referendum, idx) => {
                return (
                  <SwipeableCard
                    key={idx}
                    onVote={(vote: boolean) => voteOn(idx, vote, referendum)}
                    drag={true}
                  >
                    <ReferendumCard network={network} referendum={referendum} />
                  </SwipeableCard>
                );
              })}
            </div>
            <div style={{ display: 'flex' }}>
              <Button
                color="error"
                onPress={() => voteOn(0, false, referendums.at(0))}
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
                onPress={() => voteOn(0, true, referendums.at(0))}
                icon={<HeartIcon primaryColor="currentColor" filled />}
              />
            </div>
            <Spacer y={1} />
          </>
        )}
        {referendums?.length == 0 && votes?.length != 0 && <VotesTable votes={votes} />}
        {referendums?.length == 0 && votes?.length == 0 && <div>Failed to fetch data in time</div>}
        {!referendums && (
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
