import type {
  ApiOptions,
  SignerOptions,
  SubmittableExtrinsic,
  SubmittableExtrinsics,
} from '@polkadot/api/types';
import type { IMethod } from '@polkadot/types-codec/types/interfaces';

import { ApiPromise, SubmittableResult } from '@polkadot/api';
import {
  BN_HUNDRED,
  formatBalance as formatBalanceP,
  hexToU8a,
  isHex,
} from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { addressEq } from '@polkadot/util-crypto';
import BN from 'bn.js';
import { Conviction } from '../types';
import { DispatchError } from '@polkadot/types/interfaces';

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
  options: Partial<SignerOptions>,
  extrinsic: SubmittableExtrinsic<'promise', SubmittableResult>,
  callback: (result: SubmittableResult, unsub: () => void) => void
): Promise<void> {
  const unsub = await extrinsic.signAndSend(address, options, (callResult) => {
    callback(callResult, unsub);
  });
}

export function extractErrorMessage(
  api: ApiPromise,
  dispatchError: DispatchError
): string {
  if (dispatchError.isModule) {
    // for module errors, we have the section indexed, lookup
    const decoded = api.registry.findMetaError(dispatchError.asModule);
    const { docs, name, section } = decoded;

    return `${section}.${name}: ${docs.join(' ')}`;
  } else {
    // Other, CannotLookup, BadOrigin, no extra info
    return dispatchError.toString();
  }
}

export async function calcEstimatedFee(
  tx: SubmittableExtrinsic<'promise', SubmittableResult>,
  sender: string
): Promise<BN> {
  const { partialFee } = await tx.paymentInfo(sender);
  // 'partialFee' is the total fee minus eventual tip
  // Use some margin to be extra safe (strategy copied from https://github.com/polkadot-js/apps/blob/master/packages/page-accounts/src/modals/Transfer.tsx#L65)
  // Also see https://polkadot.js.org/docs/api/start/api.tx.subs/#payment-information
  // and https://wiki.polkadot.network/docs/build-node-interaction#fetching-a-block
  return partialFee.muln(110).div(BN_HUNDRED);
}

export function calcDelegatableBalance(
  balance: BN,
  delegateSelectedFee: BN,
  undelegateAllFee: BN
): BN {
  return BN.max(
    balance.sub(delegateSelectedFee.add(undelegateAllFee.muln(200).divn(100))),
    new BN(0)
  );
}

export function formatBalance(
  input: BN,
  decimals: number,
  unit: string
): string {
  return `${formatBalanceP(input, {
    decimals,
    withUnit: unit,
    forceUnit: 'Unit',
    withSi: false,
  })} ${unit}`;
}

export function formatConviction(conviction: Conviction): string {
  switch (conviction) {
    case Conviction.None:
      return 'No conviction';
    default:
      return conviction.toString();
  }
}

export function isValidAddress(address: string): boolean {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address));

    return true;
  } catch (error) {
    return false;
  }
}

export function addressEqual(addr1: string, addr2: string) {
  return (
    isValidAddress(addr1) && isValidAddress(addr2) && addressEq(addr1, addr2)
  );
}
