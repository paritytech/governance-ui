import {
  LoadingPanel,
  VotesSummaryTable,
  VotingPanel,
} from '../components/index.js';
import {
  Updater,
  filterOngoingReferenda,
  filterToBeVotedReferenda,
  getAllVotes,
} from '../../lifecycle/index.js';
import type { State } from '../../lifecycle/types.js';

type PanelProps = {
  state: State;
  updater: Updater;
};

function InnerPanel({ state, updater }: PanelProps): JSX.Element {
  switch (state.type) {
    case 'RestoredState':
    case 'InitialState':
      return <LoadingPanel message={`Get ready to vote!`} />;
    case 'ConnectedState': {
      const { chain, votes, details, connectedAccount } = state;
      const { allVotings, tracks, referenda } = chain;
      const ongoingReferenda = filterOngoingReferenda(referenda);
      const allVotes = getAllVotes(
        votes,
        allVotings,
        ongoingReferenda,
        connectedAccount
      );
      const referendaToBeVotedOn = filterToBeVotedReferenda(
        ongoingReferenda,
        allVotes
      );
      if (referendaToBeVotedOn.size == 0) {
        // User went through all referenda
        return (
          <VotesSummaryTable
            accountVotes={allVotes}
            onSubmitVotes={(signingAccount, accountVotes) =>
              updater.signAndSendVotes(signingAccount, accountVotes)
            }
          />
        );
      } else {
        return (
          <VotingPanel
            tracks={tracks}
            referenda={referendaToBeVotedOn}
            details={details}
            onCastVote={(index, vote) => updater.castVote(index, vote)}
          />
        );
      }
    }
  }
}

export function SwipePanel({ state, updater }: PanelProps): JSX.Element {
  return (
    <main className="flex h-full flex-auto flex-col items-center justify-center gap-2">
      <InnerPanel state={state} updater={updater} />
    </main>
  );
}
