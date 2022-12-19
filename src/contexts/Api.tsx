import { ApiPromise } from '@polkadot/api';
import { useContext, createContext, useEffect, useState } from 'react';
import { endpointFor, Network, newApi } from '../utils/polkadot-api';
import useSearchParam from '../hooks/useSearchParam';

export interface IApiContext {
  api: ApiPromise | undefined;
  network: Network | undefined;
}
// api context
const apiContext = createContext({} as IApiContext);
export const useApi = () => useContext(apiContext);

const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  const [network, setNetwork] = useState<Network>();
  const [api, setApi] = useState<ApiPromise>();
  const networkParam = useSearchParam('network');
  const rpcParam = useSearchParam('rpc');

  useEffect(() => {
    const network = Network.parse(networkParam);
    const endpoint = rpcParam ? rpcParam : endpointFor(network);
    newApi(endpoint).then((api) => {
      console.log('api:', api);
      if (rpcParam) {
        // Check that provided rpc and network point to a same logical chain
        const connectedChain = api.runtimeChain.toHuman() as Network;
        if (connectedChain != network) {
          console.error(
            `Provided RPC doesn't match network ${network}: ${rpcParam}`
          );
        } else {
          console.info(`Connected to network ${network} using RPC ${rpcParam}`);
        }
      } else {
        console.info(`Connected to network ${network.toString()}`);
      }
      setNetwork(network);
      setApi(api);
    });
  }, [networkParam, rpcParam]);
  return (
    <apiContext.Provider value={{ network, api }}>
      {children}
    </apiContext.Provider>
  );
};

export default ApiProvider;
