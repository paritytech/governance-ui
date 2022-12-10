import { ApiPromise, WsProvider } from "@polkadot/api";

// https://www.npmjs.com/package/@substrate/connect
// https://github.com/polkadot-js/api/tree/master/packages/rpc-provider

export enum Network {
    Kusama = "Kusama",
    Polkadot = "Polkadot"
}

function capitalizeFirstLetter(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export namespace Network {
  export function parse(network: string | null): Network {
    return network ? capitalizeFirstLetter(network) as Network : process.env.NETWORK && capitalizeFirstLetter(process.env.NETWORK) as Network || Network.Polkadot;
  }
}

export function endpointFor(network: Network): string {
  switch(network) {
    case Network.Kusama:
      return "wss://kusama.api.onfinality.io/public-ws";
    case Network.Polkadot:
      return "wss://polkadot.api.onfinality.io/public-ws";
  }
}

export function newApi(endpoint: string): Promise<ApiPromise> {
    const wsProvider = new WsProvider(endpoint);
    return ApiPromise.create({ provider: wsProvider });
}
