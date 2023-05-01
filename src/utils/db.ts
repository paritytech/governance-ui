import { Network, parse } from '../network.js';

export const CHAINSTATE_STORE_NAME = 'chain';
export const CUSTOM_DELEGATES_STORE_NAME = 'customDelegates';
export const DB_VERSION = 3;
export const STORES = [
  { name: CHAINSTATE_STORE_NAME },
  { name: CUSTOM_DELEGATES_STORE_NAME },
];

const BASE_DB_NAME = 'polkadot/governance';

export function dbNameFor(network: Network): string {
  return `${BASE_DB_NAME}/${network.toString()}`;
}

export async function networksFromPersistence(): Promise<Network[]> {
  const databases = await indexedDB.databases();
  const names = databases
    .filter((database) => database.name?.startsWith(BASE_DB_NAME))
    .map((database) => database.name) as string[];
  return names
    .map(parse)
    .filter(
      (network): network is { type: 'ok'; value: Network } =>
        network.type == 'ok'
    )
    .map((network) => network.value);
}
