import React from 'react';
import { ApiPromise } from '@polkadot/api';
import { vote } from '../chain/conviction-voting';
import { Button, Card, Spacer, Text } from '../components/common';
import { SigningAccount } from '../contexts';
import { AccountVote } from '../types';
import { Store, Stores } from '../utils/store';
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

async function submitBatchVotes(
  api: ApiPromise,
  connectedAccount: SigningAccount,
  accountVotes: Map<number, AccountVote>
) {
  const {
    account: { address },
    signer,
  } = connectedAccount;
  if (api && address && signer) {
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
  api,
  accountVotes,
  connectedAccount,
}: {
  api: ApiPromise;
  connectedAccount: SigningAccount | undefined;
  accountVotes: Map<number, AccountVote>;
}): JSX.Element {
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
      {connectedAccount ? (
        <Button
          color="primary"
          label="vote"
          onPress={async () => {
            await submitBatchVotes(api, connectedAccount, accountVotes);

            // Clear user votes
            const accountVotesStore = await Store.storeFor<AccountVote>(
              Stores.AccountVote
            );
            await accountVotesStore.clear();
          }}
        >
          Submit votes
        </Button>
      ) : (
        <Text
          color="secondary"
          css={{
            textAlign: 'center',
          }}
        >
          Connect to submit your votes
        </Text>
      )}
    </div>
  );
}

export default VotesTable;
