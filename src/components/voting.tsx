import React from 'react';
import { Button, Card, Spacer, Text } from '../components/common';
import { useAccount } from '../contexts/Account';
import { useApi } from '../contexts/Api';
import { Vote, VoteType } from '../types';
import { ApiPromise } from '@polkadot/api';

function VotesTable({ votes }: { votes: Vote[] }): JSX.Element {
  const { api } = useApi();
  const { connectedAccount } = useAccount();

  const createVoteTx = (api: ApiPromise, v: Vote) => {
    // ToDo: extend the Vote to include the split votes as well.
    const vote = {
      Standard: {
        vote: {
          conviction: 'None',
          aye: v.vote === VoteType.Aye,
        },
        balance: 0,
      },
    };
    const voteTx = api.tx.convictionVoting.vote(v.index, vote);
    return voteTx;
  };
  const createBatchVotes = (api: ApiPromise, votes: Array<Vote>) => {
    const txs = votes.map((vote) => createVoteTx(api, vote));
    const batchTx = api.tx.utility.batchAll([...txs]);
    return batchTx;
  };
  const submiteBatchVotes = async () => {
    const {
      account: { address },
      signer,
    } = connectedAccount;
    if (api && address && signer && votes.length > 0) {
      const batchVoteTx = createBatchVotes(api, votes);
      const unsub = await batchVoteTx.signAndSend(
        address,
        { signer },
        (callResult) => {
          const { status, ...result } = callResult;
          console.log(callResult.toHuman());
          if (status.isInBlock) {
            console.log('Transaction is in block.');
          } else if (status.isBroadcast) {
            console.log('Transaction broadcasted.');
          } else if (status.isFinalized) {
            unsub();
          } else if (status.isReady) {
            console.log('Transaction isReady.');
          } else {
            console.log(`Other status ${status}`);
          }
        }
      );
    }
    console.log('done!');
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          maxHeight: '60vh',
          width: '30vw',
          alignItems: 'center',
        }}
      >
        {votes.map((vote, idx) => {
          const isAye = vote.vote == VoteType.Aye;
          const color = isAye ? 'success' : 'warning';
          return (
            <>
              <Card key={idx} css={{ display: 'table', mw: '400px' }}>
                <Text h3 b>
                  #{vote.index}
                </Text>
                <Spacer y={2} />
                <Text h4 color={color}>
                  {isAye ? 'Aye' : 'Naye'}
                </Text>
              </Card>
              <Spacer key={`spacer-${idx}`} x={1} />
            </>
          );
        })}
      </div>
      <Spacer y={1} />
      <Button color="primary" onPress={() => submiteBatchVotes()}>
        Submit votes
      </Button>
    </div>
  );
}

export default VotesTable;
