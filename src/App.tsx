import {
  ErrorBoundary,
  Header,
  LoadingPanel,
  NotificationBox,
  VotesSummaryTable,
  VotingPanel,
} from './ui/components/index.js';
import {
  Updater,
  filterOngoingReferenda,
  filterToBeVotedReferenda,
  getAllVotes,
  useLifeCycle,
} from './lifecycle/index.js';
import type { State } from './lifecycle/types.js';

function Panel({
  state,
  updater,
}: {
  state: State;
  updater: Updater;
}): JSX.Element {
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

export function App(): JSX.Element {
  const [state, updater] = useLifeCycle();
  return (
    <ErrorBoundary>
      <NotificationBox
        reports={state.reports}
        removeReport={updater.removeReport}
      />
      <div className="m-auto flex h-screen flex-col md:container">
        <Header
          onPermissionDenied={() =>
            updater.addReport({
              type: 'Warning',
              message: 'Notification permission has been denied',
            })
          }
        />
        <main className="flex h-full flex-auto flex-col items-center justify-center gap-2">
          <Panel state={state} updater={updater} />
        </main>
      </div>
    </ErrorBoundary>
  );
}
