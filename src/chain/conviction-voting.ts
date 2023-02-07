import {
  QueryableStorage,
  Signer,
  SubmittableExtrinsics,
} from '@polkadot/api/types';
import { StorageKey } from '@polkadot/types';
import type { AccountId32 } from '@polkadot/types/interfaces/runtime';
import { u16 } from '@polkadot/types-codec';
import type {
  PalletConvictionVotingConviction,
  PalletConvictionVotingVoteAccountVote,
  PalletConvictionVotingVoteVoting,
} from '@polkadot/types/lookup';
import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';
import { Address } from '../lifecycle/types';
import { AccountVote, Conviction, Voting } from '../types';
import { batchAll } from '../utils/polkadot-api';

export function createStandardAccountVote(
  aye: boolean,
  conviction: Conviction = Conviction.None,
  balance: BN = new BN(0)
): AccountVote {
  return {
    type: 'standard',
    vote: {
      aye: aye,
      conviction: conviction,
    },
    balance: balance,
  };
}

function toConviction(o: PalletConvictionVotingConviction): Conviction {
  if (o.isNone) {
    return Conviction.None;
  } else if (o.isLocked1x) {
    return Conviction.Locked1x;
  } else if (o.isLocked2x) {
    return Conviction.Locked2x;
  } else if (o.isLocked3x) {
    return Conviction.Locked3x;
  } else if (o.isLocked4x) {
    return Conviction.Locked4x;
  } else if (o.isLocked5x) {
    return Conviction.Locked5x;
  } else {
    return Conviction.Locked6x;
  }
}

function toVote(o: PalletConvictionVotingVoteAccountVote): AccountVote {
  if (o.isStandard) {
    const standard = o.asStandard;
    return {
      type: 'standard',
      vote: {
        aye: standard.vote.isAye,
        conviction: toConviction(standard.vote.conviction),
      },
      balance: standard.balance,
    };
  } else if (o.isSplit) {
    const split = o.asSplit;
    return {
      type: 'split',
      aye: split.aye,
      nay: split.nay,
    };
  } else {
    const splitAbstain = o.asSplitAbstain;
    return {
      type: 'splitAbstain',
      aye: splitAbstain.aye,
      nay: splitAbstain.nay,
      abstain: splitAbstain.abstain,
    };
  }
}

function toVoting(o: PalletConvictionVotingVoteVoting): Voting {
  if (o.isCasting) {
    const casting = o.asCasting;
    return {
      type: 'casting',
      votes: new Map(casting.votes.map((o) => [o[0].toNumber(), toVote(o[1])])),
      delegations: casting.delegations,
      prior: {
        block: casting.prior[0].toNumber(),
        balance: casting.prior[1].toBn(),
      },
    };
  } else if (o.isDelegating) {
    const delegating = o.asDelegating;
    return {
      type: 'delegating',
      delegations: delegating.delegations,
      balance: delegating.balance,
      target: delegating.target.toString(),
      conviction: toConviction(delegating.conviction),
      prior: {
        block: delegating.prior[0].toNumber(),
        balance: delegating.prior[1].toBn(),
      },
    };
  } else {
    return { type: 'unknown' };
  }
}

function toVotings(
  votings: [StorageKey<[AccountId32, u16]>, PalletConvictionVotingVoteVoting][]
): Map<number, Voting> {
  return new Map(votings.map((o) => [o[0].args[1].toNumber(), toVoting(o[1])]));
}

export async function getVotingFor(
  api: { query: QueryableStorage<'promise'> },
  address: Address
): Promise<Map<number, Voting>> {
  return toVotings(await api.query.convictionVoting.votingFor.entries(address));
}

function toAllVotings(
  votings: [StorageKey<[AccountId32, u16]>, PalletConvictionVotingVoteVoting][]
): Map<[string, number], Voting> {
  return new Map(
    votings.map((o) => [
      [o[0].args[0].toString(), o[0].args[1].toNumber()],
      toVoting(o[1]),
    ])
  );
}

export async function getAllVotingFor(api: {
  query: QueryableStorage<'promise'>;
}): Promise<Map<[string, number], Voting>> {
  return toAllVotings(await api.query.convictionVoting.votingFor.entries());
}

function fromAccountVote(accountVote: AccountVote):
  | {
      Standard: any;
    }
  | {
      Split: any;
    }
  | {
      SplitAbstain: any;
    } {
  if (accountVote.type === 'standard') {
    const vote = accountVote.vote;
    return {
      Standard: {
        vote: {
          conviction: vote.conviction,
          aye: vote.aye,
        },
        balance: accountVote.balance,
      },
    };
  } else if (accountVote.type === 'split') {
    return {
      Split: {
        aye: accountVote.aye,
        nay: accountVote.nay,
      },
    };
  } else {
    return {
      SplitAbstain: {
        aye: accountVote.aye,
        nay: accountVote.nay,
        abstain: accountVote.abstain,
      },
    };
  }
}

export function vote(
  api: { tx: SubmittableExtrinsics<'promise'> },
  index: number,
  accountVote: AccountVote
) {
  return api.tx.convictionVoting.vote(index, fromAccountVote(accountVote));
}

export function createBatchVotes(
  api: { tx: SubmittableExtrinsics<'promise'> },
  accountVotes: Map<number, AccountVote>
) {
  const txs = [...accountVotes].map(([index, accountVote]) =>
    vote(api, index, accountVote)
  );
  return batchAll(api, txs);
}

export async function submitBatchVotes(
  api: ApiPromise,
  address: string,
  signer: Signer,
  accountVotes: Map<number, AccountVote>
) {
  const batchVoteTx = createBatchVotes(api, accountVotes);
  const unsub = await batchVoteTx.signAndSend(
    address,
    { signer },
    (callResult) => {
      const { status } = callResult;
      // TODO handle result better
      console.log(callResult.toHuman());
      if (status.isInBlock) {
        console.log('Transaction is in block.');
      } else if (status.isBroadcast) {
        console.log('Transaction broadcasted.');
      } else if (status.isFinalized) {
        unsub();
      } else if (status.isReady) {
        console.log('Transaction isReady.');
      } else {
        console.log(`Other status ${status}`);
      }
    }
  );
}
