import {
  filterOngoingReferenda,
  filterToBeVotedReferenda,
  useLifeCycle,
} from './lifecycle';
import { LoadingPanel, VotesSummaryTable, VotingPanel } from './components';
import { AccountVote, Referendum, ReferendumOngoing, Voting } from './types';
import { areEquals } from './utils/set';
import { apiFromConnectivity } from './lifecycle/types';

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

function filterOldVotes(
  votes: Map<number, AccountVote>,
  referenda: Map<number, ReferendumOngoing>
): Map<number, AccountVote> {
  return new Map(Array.from(votes).filter(([index]) => referenda.has(index)));
}

/**
 * @param votings
 * @param referenda
 * @returns
 */
function extractUserVotes(
  votings: Map<number, Voting>,
  referenda: Map<number, Referendum>
): Map<number, AccountVote> {
  // Go through user votes and restore the ones relevant to `referenda`
  const votes = new Map<number, AccountVote>();
  votings.forEach((voting) => {
    if (voting.type === 'casting') {
      voting.votes.forEach((accountVote, index) => {
        if (referenda.has(index)) {
          votes.set(index, accountVote);
        }
      });
    }
  });
  return votes;
}

export function App(): JSX.Element {
  const [state, updater] = useLifeCycle();

  switch (state.type) {
    case 'RestoredState':
    case 'InitialState':
      return <LoadingPanel message={`Get ready to vote!`} />;
    case 'ConnectedState': {
      const { connectivity, network, chain, votes } = state;
      const { /*votings, */ referenda, tracks } = chain;
      const ongoingReferenda = filterOngoingReferenda(referenda);
      const currentVotes = filterOldVotes(votes, ongoingReferenda);
      // TODO Restore on chain votings for connected user
      //const onChainVotes = extractUserVotes(votings, referenda);
      const allVotes = new Map([...currentVotes /*, ...onChainVotes */]);
      if (isVotingComplete(ongoingReferenda, allVotes)) {
        // User went through all referenda
        const api = apiFromConnectivity(connectivity);
        return <VotesSummaryTable api={api} accountVotes={allVotes} />;
      } else {
        // Let user vote on referenda
        // Only consider referenda that have not be voted on yet by user (both on-chain and in local state)
        const referendaToBeVotedOn = filterToBeVotedReferenda(
          ongoingReferenda,
          allVotes
        );
        return (
          <VotingPanel
            network={network}
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
