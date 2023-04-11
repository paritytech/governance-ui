import { endpointsFor, Network } from '../network';
import { WsReconnectProvider } from '../utils/ws-reconnect-provider';
import { newApi } from '../utils/polkadot-api';

export async function supportsOpenGov(network: Network): Promise<boolean> {
  const api = await newApi({
    provider: new WsReconnectProvider(endpointsFor(network)),
  });
  try {
    return api.registry.getModuleInstances('', 'referenda') != undefined;
  } finally {
    api.disconnect();
  }
}
