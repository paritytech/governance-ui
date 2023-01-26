import { ApiPromise } from '@polkadot/api';
import { ReferendaDeck } from './Referenda';
import { createStandardAccountVote, vote } from '../chain/conviction-voting';
import { dbNameFor, DB_VERSION, VOTE_STORE_NAME } from '../lifecycle';
import {
  Button,
  Card,
  CloseSquareIcon,
  HeartIcon,
  Spacer,
  Text,
} from '../ui/nextui';
import { SigningAccount, useAccount } from '../contexts';
import { networkFor } from '../network';
import {
  AccountVote,
  ReferendumDetails,
  ReferendumOngoing,
  Track,
} from '../types';
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
  api: ApiPromise | null;
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
      {api && connectedAccount ? (
        <Button
          color="primary"
          label="vote"
          onPress={async () => {
            await submitBatchVotes(api, connectedAccount, accountVotes);

            // Clear user votes
            const db = await open(
              dbNameFor(networkFor(api)),
              [{ name: VOTE_STORE_NAME }],
              DB_VERSION
            );
            await clear(db, VOTE_STORE_NAME);
          }}
        >
          Submit votes
        </Button>
      ) : api ? (
        <Text
          color="secondary"
          css={{
            textAlign: 'center',
          }}
        >
          Connect to submit your votes
        </Text>
      ) : (
        <Text
          color="secondary"
          css={{
            textAlign: 'center',
          }}
        >
          Connection with chain lost
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
  tracks,
  referenda,
  details,
  voteHandler,
}: {
  tracks: Map<number, Track>;
  referenda: Map<number, ReferendumOngoing>;
  details: Map<number, ReferendumDetails>;
  voteHandler: (index: number, vote: AccountVote) => void;
}): JSX.Element {
  // The referenda currently visible to the user
  const referendaWithIndex = Array.from(referenda).map(([index, referenda]) => {
    return { index, ...referenda };
  });
  const topReferenda = referendaWithIndex[0].index;
  return (
    <>
      <div className="flex flex-auto items-center justify-center">
        <ReferendaDeck
          referenda={referendaWithIndex}
          tracks={tracks}
          details={details}
          voteHandler={voteHandler}
        />
      </div>
      {topReferenda && (
        <VoteActionBar
          left={referendaWithIndex.length}
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
