import {
  filterOngoingReferenda,
  filterToBeVotedReferenda,
  getAllVotes,
  useLifeCycle,
} from './lifecycle';
import { LoadingPanel, VotesSummaryTable, VotingPanel } from './components';

export function App(): JSX.Element {
  const [state, updater] = useLifeCycle();
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

export default App;
