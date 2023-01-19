import React, { useContext, createContext, useEffect, useState } from 'react';
import { ApiPromise } from '@polkadot/api';
import { NotificationType, useNotifications } from './Notification';
import useSearchParam from '../hooks/useSearchParam';
import { measured } from '../utils/performance';
import {
  endpointFor,
  Network,
  networkFor,
  newApi,
} from '../utils/polkadot-api';
import { timeout } from '../utils/promise';

const CHAIN_CONNECTION_TIMEOUT = 5000; // in milliseconds

export interface IApiContext {
  api: ApiPromise | undefined;
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
    async function fetch() {
      const endpoint = rpcParam ? rpcParam : endpointFor(network);
      try {
        const api = await measured('api', () =>
          timeout(newApi(endpoint), CHAIN_CONNECTION_TIMEOUT)
        );
        if (rpcParam) {
          // Check that provided rpc and network point to a same logical chain
          if (networkFor(api) != network) {
            const message = `Provided RPC doesn't match network ${network}: ${rpcParam}`;
            const notification = { type: NotificationType.Error, message };
            notify(notification);
          } else {
            const message = `Connected to network ${network} using RPC ${rpcParam}`;
            const notification = {
              type: NotificationType.Notification,
              message,
            };
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
      } catch {
        setApi(undefined);
      }
    }

    fetch();
  }, [networkParam, rpcParam]);

  return <apiContext.Provider value={{ api }}>{children}</apiContext.Provider>;
};

export default ApiProvider;
