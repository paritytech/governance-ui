import {
  filterOngoingReferenda,
  filterToBeVotedReferenda,
  useLifeCycle,
} from './chainstate';
import { LoadingPanel, VotesSummaryTable, VotingPanel } from './components';
import { networkFor } from './network';
import { AccountVote, Referendum, ReferendumOngoing } from './types';
import { areEquals } from './utils/set';

/**
 * @param referenda
 * @param votes
 * @returns true if all referenda have a matching vote
 */
function isVotingComplete(
  referenda: Map<number, ReferendumOngoing>,
  votes: Map<number, AccountVote>
): boolean {
  const referendumKeys = new Set(referenda.keys());
  const voteKeys = new Set(votes.keys());
  return referendumKeys.size > 0 && areEquals(referendumKeys, voteKeys);
}

export function App(): JSX.Element {
  const [state, updater] = useLifeCycle();

  switch (state.type) {
    case 'InitialState':
      return <div>INITIAL</div>;
    case 'RestoredState':
      return <div>RESTORED</div>;
    case 'ConnectingState':
      return <div>CONNECTING</div>;
    case 'OfflineState':
      return <div>OFFLINE</div>;
    case 'SyncingState':
      return (
        <LoadingPanel
          message={`Get ready to vote! #${JSON.stringify(state.since)}`}
        />
      );
    case 'SyncedState': {
      const { api, chain, votes } = state;
      const { referenda, tracks } = chain;
      const ongoingReferenda = filterOngoingReferenda(referenda);
      if (isVotingComplete(ongoingReferenda, votes)) {
        // User went through all referenda
        return <VotesSummaryTable api={api} accountVotes={votes} />;
      } else {
        // Let user vote on referenda
        // Only consider referenda that have not be voted on yet by user (both on-chain and in local state)
        const referendaToBeVotedOn = filterToBeVotedReferenda(
          ongoingReferenda,
          votes
        );
        return (
          <VotingPanel
            network={networkFor(api)}
            voteHandler={(index, vote) => updater.castVote(index, vote)}
            tracks={tracks}
            referenda={Array.from(referendaToBeVotedOn)}
          />
        );
      }
    }
  }
}

export default App;
