import { ApiPromise } from '@polkadot/api';
import { err, ok, Result } from './utils/index.js';
import { capitalizeFirstLetter } from './utils/string.js';

export enum Network {
  Kusama = 'Kusama',
  Polkadot = 'Polkadot',
}

const DEFAULT_NETWORK_ENV = process.env.DEFAULT_NETWORK;
export const DEFAULT_NETWORK = DEFAULT_NETWORK_ENV
  ? (capitalizeFirstLetter(DEFAULT_NETWORK_ENV) as Network)
  : Network.Kusama;

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
      return ['wss://kusama-rpc.polkadot.io'];
    case Network.Polkadot:
      return ['wss://rpc.polkadot.io'];
  }
}
