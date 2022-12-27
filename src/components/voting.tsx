import React from 'react';
import { ApiPromise } from '@polkadot/api';
import { vote } from '../chain/conviction-voting';
import { Button, Card, Spacer, Text } from '../components/common';
import { useAccount, useApi } from '../contexts';
import { AccountVote } from '../types';
import styles from './voting.module.css';

function createBatchVotes(
  api: ApiPromise,
  accountVotes: Map<number, AccountVote>
) {
  const txs = [...accountVotes].map(([index, accountVote]) =>
    vote(api, index, accountVote)
  );
  return api.tx.utility.batchAll([...txs]);
}

function VoteDetails({
  accountVote,
}: {
  accountVote: AccountVote;
}): JSX.Element {
  switch (accountVote.type) {
    case 'standard': {
      const isAye = accountVote.vote.aye;
      const color = isAye ? 'success' : 'warning';
      return (
        <Text h4 color={color}>
          {isAye ? 'Aye' : 'Naye'}
        </Text>
      );
    }
    default: {
      return <Text h4>TODO</Text>;
    }
  }
}

function VotesTable({
  accountVotes,
}: {
  accountVotes: Map<number, AccountVote>;
}): JSX.Element {
  const { api } = useApi();
  const { connectedAccount } = useAccount();

  const submiteBatchVotes = async () => {
    if (connectedAccount) {
      const {
        account: { address },
        signer,
      } = connectedAccount;
      if (api && address && signer && accountVotes.size > 0) {
        const batchVoteTx = createBatchVotes(api, accountVotes);
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
        {[...accountVotes.entries()].map(([index, accountVote]) => {
          return (
            <div key={index} style={{ width: '100%' }}>
              <Card>
                <Text h3 b>
                  #{index}
                </Text>
                <Spacer y={2} />
                <VoteDetails accountVote={accountVote} />
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
