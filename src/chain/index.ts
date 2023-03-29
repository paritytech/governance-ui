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
        description: 'Root is the track for the most important things',
      },
      {
        id: 15,
        title: 'Auction Admin',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis dui vitae leo aliquam iaculis. Maecenas faucibus nisi id lacus lacinia ornare. Phasellus in eros dignissim',
      },
      {
        id: 10,
        title: 'Staking Admin',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris quis dui vitae leo aliquam iaculis. Maecenas faucibus nisi id lacus lacinia ornare. Phasellus in eros dignissim',
      },
    ],
  },
  {
    title: 'Governance',
    tracks: [
      {
        id: 12,
        title: 'Lease Admin',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      },
      {
        id: 14,
        title: 'General Admin',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        id: 20,
        title: 'Referendum Canceler',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        id: 21,
        title: 'Referendum Killer',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        id: 10,
        title: 'Staking Admin',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
    ],
  },
  {
    title: 'Treasury',
    tracks: [
      {
        id: 30,
        title: 'Small Tipper',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        id: 31,
        title: 'Big Tipper',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        id: 32,
        title: 'Small Spender',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        id: 33,
        title: 'Medium Spender',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        id: 34,
        title: 'Big Spender',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        id: 11,
        title: 'Treasurer',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
    ],
  },
  {
    title: 'Fellowship',
    tracks: [
      {
        id: 1,
        title: 'Whitelisted Caller',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
      {
        id: 13,
        title: 'Fellowship Admin',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      },
    ],
  },
];
