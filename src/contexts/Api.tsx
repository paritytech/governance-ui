import React, { useContext, createContext, useEffect, useState } from 'react';
import { ApiPromise } from '@polkadot/api';
import useSearchParam from '../hooks/useSearchParam';
import { endpointFor, Network, newApi } from '../utils/polkadot-api';
import { NotificationType, useNotifications } from './Notification';

export interface IApiContext {
  api: ApiPromise | undefined;
  network: Network;
}

// api context
const apiContext = createContext({} as IApiContext);
export const useApi = () => useContext(apiContext);

const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  const [api, setApi] = useState<ApiPromise>();
  const networkParam = useSearchParam('network');
  const network = Network.parse(networkParam);
  const rpcParam = useSearchParam('rpc');
  const { notify } = useNotifications();

  useEffect(() => {
    const endpoint = rpcParam ? rpcParam : endpointFor(network);
    performance.mark('start:api');
    newApi(endpoint).then((api) => {
      performance.mark('end:api');
      performance.measure('api', 'start:api', 'end:api');
      if (rpcParam) {
        // Check that provided rpc and network point to a same logical chain
        const connectedChain = api.runtimeChain.toHuman() as Network;
        if (connectedChain != network) {
          const message = `Provided RPC doesn't match network ${network}: ${rpcParam}`;
          const notification = { type: NotificationType.Error, message };
          notify(notification);
        } else {
          const message = `Connected to network ${network} using RPC ${rpcParam}`;
          const notification = { type: NotificationType.Notification, message };
          console.info(message);
          notify(notification);
        }
      } else {
        const message = `Connected to network ${network.toString()}`;
        const notification = { type: NotificationType.Notification, message };
        console.info(message);
        notify(notification);
      }
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
