import React, { useContext, createContext, useEffect, useState } from 'react';
import { ApiPromise } from '@polkadot/api';
import { useEndpointsParams } from '../hooks';
import { measured } from '../utils/performance';
import { newApi } from '../utils/polkadot-api';
import { timeout } from '../utils/promise';
import { NotificationType, useNotifications } from './Notification';

const CHAIN_CONNECTION_TIMEOUT = 5000; // in milliseconds

const apiContext = createContext({} as ApiPromise | undefined);

export const useApi = () => useContext(apiContext);

const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  const { notify } = useNotifications();
  const endpoints = useEndpointsParams();
  const [api, setApi] = useState<ApiPromise>();

  useEffect(() => {
    async function fetch() {
      if (endpoints.type == 'ok') {
        try {
          const api = await measured('api', () =>
            timeout(newApi(endpoints.value), CHAIN_CONNECTION_TIMEOUT)
          );
          await api.isReady;
          setApi(api);
        } catch (e) {
          // TODO have a retry action
          notify({
            type: NotificationType.Error,
            message: `Failed to connect to the chain in ${
              CHAIN_CONNECTION_TIMEOUT / 1000
            } seconds`,
          });
        }
      } else {
        // Endpoints configuration error, require user action
        notify({
          type: NotificationType.Error,
          message: endpoints.error.toString(),
        });
      }
    }
    fetch();
  }, [endpoints]);

  return <apiContext.Provider value={api}>{children}</apiContext.Provider>;
};

export default ApiProvider;
