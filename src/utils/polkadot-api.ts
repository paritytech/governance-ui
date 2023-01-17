import { ApiPromise } from '@polkadot/api';
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
