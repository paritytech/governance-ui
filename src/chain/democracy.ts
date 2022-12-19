import { ApiPromise } from '@polkadot/api';
import type { DeriveReferendumExt } from '@polkadot/api-derive/types';
import { Referendum } from '../types';

export async function getAllReferendums(
  api: ApiPromise
): Promise<Referendum[]> {
  const referenda = await api.derive.democracy.referendums();
  return referenda.map((referendum: DeriveReferendumExt) => {
    return { index: referendum.index.toNumber() };
  });
}
