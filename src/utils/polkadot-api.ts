import { ApiPromise, WsProvider } from "@polkadot/api";

// https://www.npmjs.com/package/@substrate/connect
// https://github.com/polkadot-js/api/tree/master/packages/rpc-provider

export enum Network {
    Kusama = "Kusama",
    Polkadot = "Polkadot"
}

export function endpointFor(network: Network): string {
  switch(network) {
    case Network.Kusama:
      return "wss://kusama.api.onfinality.io/public-ws";
    case Network.Polkadot:
      return "wss://polkadot.api.onfinality.io/public-ws";
  }
}

export async function newApi(endpoint: string): Promise<ApiPromise> {
    const wsProvider = new WsProvider(endpoint);
    return await ApiPromise.create({ provider: wsProvider });
}