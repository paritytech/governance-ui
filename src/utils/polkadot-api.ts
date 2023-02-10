import { ApiPromise } from '@polkadot/api';
import { ApiOptions, SubmittableExtrinsics } from '@polkadot/api/types';
import { IMethod } from '@polkadot/types-codec/types/interfaces';

const DEFAULT_OPTIONS = {
  noInitWarn: true,
  throwOnConnect: false,
};

export function newApi(options?: ApiOptions): Promise<ApiPromise> {
  return ApiPromise.create({
    ...DEFAULT_OPTIONS,
    ...options,
  });
}

export function batchAll(
  api: { tx: SubmittableExtrinsics<'promise'> },
  calls: IMethod[]
) {
  return api.tx.utility.batchAll([...calls]);
}
