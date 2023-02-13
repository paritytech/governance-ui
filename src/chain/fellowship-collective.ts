import { QueryableStorage } from '@polkadot/api/types';
import { Option, StorageKey } from '@polkadot/types';
import type { AccountId32 } from '@polkadot/types/interfaces/runtime';
import type { PalletRankedCollectiveMemberRecord } from '@polkadot/types/lookup';
import { Address, Fellow } from '../lifecycle/types.js';

export async function getAllMembers(api: {
  query: QueryableStorage<'promise'>;
}): Promise<Map<Address, Fellow>> {
  return toAllFellows(await api.query.fellowshipCollective.members.entries());
}
function toAllFellows(
  members: Array<
    [StorageKey<[AccountId32]>, Option<PalletRankedCollectiveMemberRecord>]
  >
): Map<string, Fellow> {
  const existingMembers = members.filter(
    (member) => member[1].isSome
  ) as unknown as Array<
    [StorageKey<[AccountId32]>, PalletRankedCollectiveMemberRecord]
  >;
  return new Map(
    existingMembers.map((member) => [
      member[0].args[0].toString(),
      toFellow(member[1]),
    ])
  );
}

function toFellow(member: PalletRankedCollectiveMemberRecord): Fellow {
  // TODO fix: member.rank fails, rank is undefined
  return {
    rank: Number.parseInt(member.toJSON().rank as string),
  };
}
