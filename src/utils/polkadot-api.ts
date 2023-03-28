import { ApiPromise, SubmittableResult } from '@polkadot/api';
import {
  ApiOptions,
  Signer,
  SubmittableExtrinsic,
  SubmittableExtrinsics,
} from '@polkadot/api/types';
import { IMethod } from '@polkadot/types-codec/types/interfaces';
import BN from 'bn.js';

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
): SubmittableExtrinsic<'promise', SubmittableResult> {
  return api.tx.utility.batchAll([...calls]);
}

export async function signAndSend(
  address: string,
  signer: Signer,
  extrinsic: SubmittableExtrinsic<'promise', SubmittableResult>
) {
  const unsub = await extrinsic.signAndSend(
    address,
    { signer },
    (callResult) => {
      const { status, blockNumber } = callResult;
      // TODO handle result better
      if (status.isInBlock) {
        console.log(`Transaction is in block #${blockNumber}.`);
      } else if (status.isBroadcast) {
        console.log('Transaction broadcasted.');
      } else if (status.isFinalized) {
        console.log(`Transaction is finalized at block #${blockNumber}.`);
        unsub();
      } else if (status.isReady) {
        console.log('Transaction isReady.');
      } else {
        console.log(`Other status ${status}`);
      }
    }
  );
}

export async function calcEstimatedFee(
  tx: SubmittableExtrinsic<'promise', SubmittableResult>,
  sender: string
): Promise<BN> {
  const { partialFee } = await tx.paymentInfo(sender);
  return partialFee.muln(130).divn(100); // to count for weights fee = partialFee * 1.3
}
