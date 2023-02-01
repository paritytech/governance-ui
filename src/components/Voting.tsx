import { ReferendaDeck } from './Referenda';
import { createStandardAccountVote } from '../chain/conviction-voting';
import {
  Button,
  Card,
  CloseSquareIcon,
  HeartIcon,
  Spacer,
  Text,
} from '../ui/nextui';
import { SigningAccount, useAccount } from '../contexts';
import {
  AccountVote,
  ReferendumDetails,
  ReferendumOngoing,
  Track,
} from '../types';

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
  accountVotes,
  onSubmitVotes,
}: {
  accountVotes: Map<number, AccountVote>;
  onSubmitVotes: (
    connectedAccount: SigningAccount,
    accountVotes: Map<number, AccountVote>
  ) => void;
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
          onPress={() => onSubmitVotes(connectedAccount, accountVotes)}
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
  tracks,
  referenda,
  details,
  onCastVote,
}: {
  tracks: Map<number, Track>;
  referenda: Map<number, ReferendumOngoing>;
  details: Map<number, ReferendumDetails>;
  onCastVote: (index: number, vote: AccountVote) => void;
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
          onCastVote={onCastVote}
        />
      </div>
      {topReferenda && (
        <VoteActionBar
          left={referendaWithIndex.length}
          onAccept={() =>
            topReferenda &&
            onCastVote(topReferenda, createStandardAccountVote(true))
          }
          onRefuse={() =>
            topReferenda &&
            onCastVote(topReferenda, createStandardAccountVote(false))
          }
        />
      )}
    </>
  );
}
