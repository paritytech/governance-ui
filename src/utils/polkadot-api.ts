import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsics } from '@polkadot/api/types';
import { IMethod } from '@polkadot/types-codec/types/interfaces';
import { WsReconnectProvider } from './ws-reconnect-provider';

export function newApi(endpoints: string[]): Promise<ApiPromise> {
  const provider = new WsReconnectProvider(endpoints);
  // TODO handle some failure/reconnection?
  return ApiPromise.create({
    provider,
    noInitWarn: true,
    throwOnConnect: false,
  });
}

export function batchAll(
  api: { tx: SubmittableExtrinsics<'promise'> },
  calls: IMethod[]
) {
  return api.tx.utility.batchAll([...calls]);
}
