import {
  filterOngoingReferenda,
  filterToBeVotedReferenda,
  getAllVotes,
  useLifeCycle,
} from './lifecycle';
import { LoadingPanel, VotesSummaryTable, VotingPanel } from './components';
import { apiFromConnectivity } from './lifecycle/types';

export function App(): JSX.Element {
  const [state, updater] = useLifeCycle();
  let component: JSX.Element | undefined;
  switch (state.type) {
    case 'RestoredState':
    case 'InitialState':
      component = <LoadingPanel message={`Get ready to vote!`} />;
      break;
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
        component = <VotesSummaryTable api={api} accountVotes={allVotes} />;
      } else {
        component = (
          <VotingPanel
            tracks={tracks}
            referenda={referendaToBeVotedOn}
            details={details}
            voteHandler={(index, vote) => updater.castVote(index, vote)}
          />
        );
        break;
      }
    }
  }
  return (
    <>
      <div data-app-state={state.type} hidden />
      {component}
    </>
  );
}

export default App;
