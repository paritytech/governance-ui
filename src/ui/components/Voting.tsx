import type {
  AccountVote,
  ReferendumDetails,
  ReferendumOngoing,
  Track,
  SigningAccount,
} from '../../types.js';

import { ReferendaDeck } from './Referenda.js';
import { createStandardAccountVote } from '../../chain/conviction-voting.js';
import { Button, Card, CloseSquareIcon, HeartIcon } from '../lib/index.js';
import { useAccount } from '../../contexts/index.js';

function VoteDetails({
  accountVote,
}: {
  accountVote: AccountVote;
}): JSX.Element {
  switch (accountVote.type) {
    case 'standard': {
      const isAye = accountVote.vote.aye;
      return <div>{isAye ? 'Aye' : 'Naye'}</div>;
    }
    default: {
      return <div>TODO</div>;
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
                <div>#{index}</div>
                <VoteDetails accountVote={accountVote} />
              </Card>
            </div>
          );
        })}
      </div>
      {connectedAccount ? (
        <Button onClick={() => onSubmitVotes(connectedAccount, accountVotes)}>
          Submit votes
        </Button>
      ) : (
        <div className="text-center">Connect to submit your votes</div>
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
    <div className="m-4 flex items-center gap-2">
      <Button onClick={onRefuse}>
        <CloseSquareIcon className="fill-red-400" />
      </Button>
      <div>{left} left</div>
      <Button onClick={onAccept}>
        <HeartIcon className="fill-green-400" />
      </Button>
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
