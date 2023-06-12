import { ApiPromise } from '@polkadot/api';
import { err, ok, Result } from './utils/index.js';
import { capitalizeFirstLetter } from './utils/string.js';

export enum Network {
  Kusama = 'Kusama',
  Polkadot = 'Polkadot',
}

export function defaultNetwork(): Network {
  const env = process.env.DEFAULT_NETWORK;
  if (env) {
    return capitalizeFirstLetter(env) as Network;
  }
  return Network.Polkadot;
}

export function parse(s: string): Result<Network> {
  const network = capitalizeFirstLetter(s) as Network;
  return network ? ok(network) : err(new Error(`Unrecognized network ${s}`));
}

export function networkFor(api: ApiPromise): Network {
  return api.runtimeChain.toHuman() as Network;
}

export function endpointsFor(network: Network): string[] {
  switch (network) {
    case Network.Kusama:
      return [
        //'wss://1rpc.io/ksm'
        //'wss://kusama-public-rpc.blockops.network/ws'
        //'wss://kusama-rpc.dwellir.com'
        //'wss://rpc-kusama.luckyfriday.io'
        //'wss://kusama-rpc.polkadot.io',
        'wss://apps-kusama-rpc.polkadot.io',
        //'wss://kusama.api.onfinality.io/public-ws',
      ];
    case Network.Polkadot:
      return ['wss://apps-rpc.polkadot.io'];
  }
}
