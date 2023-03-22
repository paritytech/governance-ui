import { ApiPromise, SubmittableResult } from '@polkadot/api';
import {
  ApiOptions,
  Signer,
  SubmittableExtrinsic,
  SubmittableExtrinsics,
} from '@polkadot/api/types';
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

export async function submitBatch(
  address: string,
  signer: Signer,
  extrinsic: SubmittableExtrinsic<'promise', SubmittableResult>
) {
  const unsub = await extrinsic.signAndSend(
    address,
    { signer },
    (callResult) => {
      const { status } = callResult;
      // TODO handle result better
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
