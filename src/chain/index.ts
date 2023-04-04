import { endpointsFor, Network } from '../network';
import { WsReconnectProvider } from '../utils/ws-reconnect-provider';
import { newApi } from '../utils/polkadot-api';

export async function supportsOpenGov(network: Network): Promise<boolean> {
  const api = await newApi({
    provider: new WsReconnectProvider(endpointsFor(network)),
  });
  return api.registry.getModuleInstances('', 'referenda') != undefined;
}

export const trackCategories = [
  {
    title: 'Admin',
    tracks: [
      {
        id: 0,
        title: 'Root',
        description: 'Origin for upgrades, fixes, and network rescues',
      },
      {
        id: 15,
        title: 'Auction Admin',
        description: 'Origin for starting auctions',
      },
    ],
  },
  {
    title: 'Governance',
    tracks: [
      {
        id: 12,
        title: 'Lease Admin',
        description: 'Origin able to force slot leases',
      },
      {
        id: 14,
        title: 'General Admin',
        description: 'Origin for managing the registrar',
      },
      {
        id: 20,
        title: 'Referendum Canceler',
        description: 'Origin able to cancel referenda',
      },
      {
        id: 21,
        title: 'Referendum Killer',
        description: 'Origin able to kill referenda',
      },
      {
        id: 10,
        title: 'Staking Admin',
        description: 'Origin for canceling slashes',
      },
    ],
  },
  {
    title: 'Treasury',
    tracks: [
      {
        id: 30,
        title: 'Small Tipper',
        description:
          'Origin able to spend up to 1 DOT from the treasury at once',
      },
      {
        id: 31,
        title: 'Big Tipper',
        description:
          'Origin able to spend up to 10 DOT from the treasury at once',
      },
      {
        id: 32,
        title: 'Small Spender',
        description:
          'Origin able to spend up to 100 DOT from the treasury at once',
      },
      {
        id: 33,
        title: 'Medium Spender',
        description:
          'Origin able to spend up to 200 DOT from the treasury at once',
      },
      {
        id: 34,
        title: 'Big Spender',
        description:
          'Origin able to spend up to 400 DOT from the treasury at once',
      },
      {
        id: 11,
        title: 'Treasurer',
        description:
          'Origin for spending (any amount of) funds until the upper limit of 1,000 DOT',
      },
    ],
  },
  {
    title: 'Fellowship',
    tracks: [
      {
        id: 1,
        title: 'Whitelisted Caller',
        description: 'Origin commanded by members of the Polkadot Fellowship',
      },
      {
        id: 13,
        title: 'Fellowship Admin',
        description: 'Origin for managing the composition of the fellowship',
      },
    ],
  },
];
