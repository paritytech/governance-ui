import { ApiPromise } from '@polkadot/api';
import { capitalizeFirstLetter } from './utils/string';

export enum Network {
  Kusama = 'Kusama',
  Polkadot = 'Polkadot',
}

const DEFAULT_NETWORK_ENV = process.env.DEFAULT_NETWORK;
export const DEFAULT_NETWORK = DEFAULT_NETWORK_ENV
  ? (capitalizeFirstLetter(DEFAULT_NETWORK_ENV) as Network)
  : Network.Polkadot;

export namespace Network {
  export function parse(network: string): Network | null {
    return capitalizeFirstLetter(network) as Network;
  }
}

export function networkFor(api: ApiPromise): Network {
  return api.runtimeChain.toHuman() as Network;
}

export function endpointsFor(network: Network): string[] {
  switch (network) {
    case Network.Kusama:
      return ['wss://kusama-rpc.polkadot.io'];
    case Network.Polkadot:
      return ['wss://rpc.polkadot.io'];
  }
}
