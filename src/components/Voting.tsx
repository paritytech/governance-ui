import { ApiPromise } from '@polkadot/api';
import { ReferendaDeck } from './Referenda';
import { createStandardAccountVote, vote } from '../chain/conviction-voting';
import { DB_NAME, DB_VERSION, VOTE_STORE_NAME } from '../chainstate';
import {
  Button,
  Card,
  CloseSquareIcon,
  HeartIcon,
  Spacer,
  Text,
} from '../ui/nextui';
import { SigningAccount, useAccount } from '../contexts';
import { Network } from '../network';
import { AccountVote, ReferendumOngoing, Track } from '../types';
import { clear, open } from '../utils/indexeddb';

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

export function VotesSummaryTable({
  api,
  accountVotes,
}: {
  api: ApiPromise;
  accountVotes: Map<number, AccountVote>;
}): JSX.Element {
  const { connectedAccount } = useAccount();
  return (
    <div className="flex flex-col">
      <div className="flex max-h-[60vh] w-[30vw] flex-col items-center overflow-auto">
        {[...accountVotes.entries()].map(([index, accountVote]) => {
          return (
            <div key={index} className="w-full">
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
            const db = await open(
              DB_NAME,
              [{ name: VOTE_STORE_NAME }],
              DB_VERSION
            );
            await clear(db, VOTE_STORE_NAME);
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

export function VoteActionBar({
  left,
  onAccept,
  onRefuse,
}: {
  left: number;
  onAccept: () => void;
  onRefuse: () => void;
}): JSX.Element {
  return (
    <div className="flex items-center">
      <Button
        label="Refuse"
        color="error"
        onPress={onRefuse}
        icon={<CloseSquareIcon />}
      />
      <Spacer x={1} />
      <Text>{left} left</Text>
      <Spacer x={1} />
      <Button
        label="Accept"
        color="success"
        onPress={onAccept}
        icon={<HeartIcon />}
      />
    </div>
  );
}

export function VotingPanel({
  network,
  tracks,
  referenda,
  voteHandler,
}: {
  network: Network;
  tracks: Map<number, Track>;
  referenda: [number, ReferendumOngoing][];
  voteHandler: (index: number, vote: AccountVote) => void;
}): JSX.Element {
  // The referenda currently visible to the user
  const topReferenda = referenda.at(0)?.[0];
  return (
    <>
      <div className="flex flex-auto items-center justify-center">
        <ReferendaDeck
          network={network}
          referenda={referenda}
          tracks={tracks}
          voteHandler={voteHandler}
        />
      </div>
      {referenda.length > 0 && (
        <VoteActionBar
          left={referenda.length}
          onAccept={() =>
            topReferenda &&
            voteHandler(topReferenda, createStandardAccountVote(true))
          }
          onRefuse={() =>
            topReferenda &&
            voteHandler(topReferenda, createStandardAccountVote(false))
          }
        />
      )}
    </>
  );
}
