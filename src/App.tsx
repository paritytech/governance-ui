import {
  filterOngoingReferenda,
  filterToBeVotedReferenda,
  getAllVotes,
  useLifeCycle,
} from './lifecycle/index.js';
import {
  LoadingPanel,
  VotesSummaryTable,
  VotingPanel,
} from './components/index.js';
import { apiFromConnectivity } from './lifecycle/types.js';

export function App(): JSX.Element {
  const [state, updater] = useLifeCycle();

  switch (state.type) {
    case 'RestoredState':
    case 'InitialState':
      return <LoadingPanel message={`Get ready to vote!`} />;
    case 'ConnectedState': {
      const { connectivity, chain, votes, details, connectedAccount } = state;
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
        const api = apiFromConnectivity(connectivity);
        return <VotesSummaryTable api={api} accountVotes={allVotes} />;
      } else {
        return (
          <VotingPanel
            tracks={tracks}
            referenda={referendaToBeVotedOn}
            details={details}
            voteHandler={(index, vote) => updater.castVote(index, vote)}
          />
        );
      }
    }
  }
}

export default App;
