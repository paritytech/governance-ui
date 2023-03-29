import { ApiPromise } from '@polkadot/api';
import { supportsOpenGov } from './chain/index.js';
import { err, ok, Result } from './utils/index.js';
import { capitalizeFirstLetter } from './utils/string.js';

export enum Network {
  Kusama = 'Kusama',
  Polkadot = 'Polkadot',
}

export async function defaultNetwork(): Promise<Network> {
  const env = process.env.DEFAULT_NETWORK;
  if (env) {
    return capitalizeFirstLetter(env) as Network;
  }
  // Remove in new release once polkdato supports OpenGov
  return (await supportsOpenGov(Network.Polkadot))
    ? Network.Polkadot
    : Network.Kusama;
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
      return ['wss://kusama-rpc.polkadot.io'];
    case Network.Polkadot:
      return ['wss://rpc.polkadot.io'];
  }
}
