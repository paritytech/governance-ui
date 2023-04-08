import { endpointsFor, Network } from '../network';
import { WsReconnectProvider } from '../utils/ws-reconnect-provider';
import { newApi } from '../utils/polkadot-api';

export type TrackType = {
  id: number;
  title: string;
  description: string;
};

export type TrackCategoryType = {
  title: string;
  tracks: TrackType[];
};

export async function supportsOpenGov(network: Network): Promise<boolean> {
  const api = await newApi({
    provider: new WsReconnectProvider(endpointsFor(network)),
  });
  return api.registry.getModuleInstances('', 'referenda') != undefined;
}
