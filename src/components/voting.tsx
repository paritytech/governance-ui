import React from 'react';
import { ApiPromise } from '@polkadot/api';
import { Button, Card, Spacer, Text } from '../components/common';
import { useAccount } from '../contexts/Account';
import { useApi } from '../contexts/Api';
import { Vote } from '../types';
import styles from './voting.module.css';

function createVoteTx(api: ApiPromise, index: number, vote: Vote) {
  // ToDo: extend the Vote to include the split votes as well.
  const convictionVoting = {
    Standard: {
      vote: {
        conviction: 'None',
        aye: vote === Vote.Aye,
      },
      balance: 0,
    },
  };
  return api.tx.convictionVoting.vote(index, convictionVoting);
}

function createBatchVotes(api: ApiPromise, votes: Map<number, Vote>) {
  const txs = [...votes].map(([index, vote]) => createVoteTx(api, index, vote));
  return api.tx.utility.batchAll([...txs]);
}

function VotesTable({ votes }: { votes: Map<number, Vote> }): JSX.Element {
  const { api } = useApi();
  const { connectedAccount } = useAccount();

  const submiteBatchVotes = async () => {
    if (connectedAccount) {
      const {
        account: { address },
        signer,
      } = connectedAccount;
      if (api && address && signer && votes.size > 0) {
        const batchVoteTx = createBatchVotes(api, votes);
        const unsub = await batchVoteTx.signAndSend(
          address,
          { signer },
          (callResult) => {
            const { status } = callResult;
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
    }
    // ToDo: remove this log afrer proper error notifications are added to the UX
    console.log('no account is connected');
  };
  return (
    <div className={styles.table}>
      <div>
        {[...votes.entries()].map(([index, vote]) => {
          const isAye = vote == Vote.Aye;
          const color = isAye ? 'success' : 'warning';
          return (
            <div key={index} style={{ width: '100%' }}>
              <Card>
                <Text h3 b>
                  #{index}
                </Text>
                <Spacer y={2} />
                <Text h4 color={color}>
                  {isAye ? 'Aye' : 'Naye'}
                </Text>
              </Card>
            </div>
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
