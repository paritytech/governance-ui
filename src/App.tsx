import {
  filterOngoingReferenda,
  filterToBeVotedReferenda,
  useLifeCycle,
} from './lifecycle';
import { LoadingPanel, VotesSummaryTable, VotingPanel } from './components';
import { AccountVote, Referendum, ReferendumOngoing, Voting } from './types';
import { areEquals } from './utils/set';
import { Address, apiFromConnectivity } from './lifecycle/types';

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

/**
 * @param votes
 * @param referenda
 * @returns filter away `votes` that do not map to `referenda`
 */
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
  address: Address,
  allVotings: Map<Address, Map<number, Voting>>,
  referenda: Map<number, Referendum>
): Map<number, AccountVote> {
  // Go through user votes and restore the ones relevant to `referenda`
  const votes = new Map<number, AccountVote>();
  const votings = allVotings.get(address);
  if (votings) {
    votings.forEach((voting) => {
      if (voting.type === 'casting') {
        voting.votes.forEach((accountVote, index) => {
          if (referenda.has(index)) {
            votes.set(index, accountVote);
          }
        });
      }
    });
  }
  return votes;
}

function getAllVotes(
  votes: Map<number, AccountVote>,
  allVotings: Map<Address, Map<number, Voting>>,
  referenda: Map<number, ReferendumOngoing>,
  connectedAccount?: Address
): Map<number, AccountVote> {
  const currentVotes = filterOldVotes(votes, referenda);
  if (connectedAccount) {
    const onChainVotes = extractUserVotes(
      connectedAccount,
      allVotings,
      referenda
    );
    return new Map([...currentVotes, ...onChainVotes]);
  } else {
    return currentVotes;
  }
}

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
