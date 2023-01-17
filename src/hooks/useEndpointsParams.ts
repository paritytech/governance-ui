import { useMemo } from 'react';
import { DEFAULT_NETWORK, endpointsFor, Network } from '../network';
import { useSearchParams } from './useSearchParams';
import { err, ok, Result } from '../utils';

function isValidEnpoint(endpoint: string): boolean {
  try {
    const url = new URL(endpoint);
    return url.protocol === 'ws:' || url.protocol === 'wss:';
  } catch (err) {
    return false;
  }
}

function networkFromParam(param: string): Result<Network> {
  const network = Network.parse(param);
  if (network) {
    return ok(network);
  } else {
    return err(new Error(`Unrecognized network ${network}`));
  }
}

export function deriveEnpoints(
  rpcParam?: string,
  networkParam?: string
): Result<string[]> {
  if (rpcParam) {
    const endpoints = rpcParam.split('|');
    const invalidEndpoints = endpoints.filter(
      (endpoint) => !isValidEnpoint(endpoint)
    );
    if (invalidEndpoints.length !== 0) {
      return err(
        new Error(
          `Some of provided rpcs are not valid endpoints: ${invalidEndpoints}`
        )
      );
    }
    return ok(endpoints);
  } else {
    const network = networkParam
      ? networkFromParam(networkParam)
      : ok(DEFAULT_NETWORK);
    if (network.type == 'ok') {
      return ok(endpointsFor(network.value));
    } else {
      return network;
    }
  }
}

export function useEndpointsParams(): Result<string[]> {
  const { rpc, network } = useSearchParams(['rpc', 'network']);
  return useMemo(() => {
    if (rpc && network) {
      return err(new Error('Both rpc and network query parameters are used'));
    } else {
      return deriveEnpoints(rpc, network);
    }
  }, [rpc, network]);
}
