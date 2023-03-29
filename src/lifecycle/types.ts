import type {
  AccountVote,
  Referendum,
  ReferendumDetails,
  Track,
  Voting,
} from '../types.js';

import BN from 'bn.js';
import { Network } from '../network.js';

export type Defaults = {
  network: Network;
};

export type Settings = {
  readonly default: Defaults;
};

export type Address = string;

export type Fellow = {
  rank: number;
};

export type AccountChainState = {
  allVotings: Map<Address, Map<number, Voting>>;
  balance: BN;
};

export type ChainProperties = {
  ss58Format?: number;
  tokenDecimals: Array<number>;
  tokenSymbols: Array<string>;
};

export type ChainState = {
  properties: ChainProperties;
  tracks: Map<number, Track>;
  referenda: Map<number, Referendum>;
  fellows: Map<Address, Fellow>;
};

export type PersistedDataContext = {
  votes: Map<number, AccountVote>;
};

export type Warning = {
  type: 'Warning';
  message: string;
};

export type Error = {
  type: 'Error';
  message: string;
};

export type Report = Warning | Error;

// States

export type Delegate = {
  name: string;
  address: string;
  manifesto: string;
};

type BaseState = {
  reports?: Report[];
  connectedAddress: string | null;
  connectivity: Connectivity;
  details: Map<number, ReferendumDetails>;
  indexes: Record<string, object>;
  delegates: Array<Delegate>;
};

type BaseRestoredState = BaseState &
  PersistedDataContext & {
    network: Network;
  };

export type InitialState = BaseState & {
  type: 'InitialState';
};

export type RestoredState = BaseRestoredState & {
  type: 'RestoredState';
};

export type ConnectedState = BaseRestoredState & {
  type: 'ConnectedState';
  chain: ChainState;
  account?: AccountChainState;
};

export type State = InitialState | RestoredState | ConnectedState;

// Actions

export type AddReport = {
  type: 'AddReport';
  report: Report;
};

export type RemoveReport = {
  type: 'RemoveReport';
  index: number;
};

export type SetRestored = PersistedDataContext & {
  type: 'SetRestored';
  network: Network;
};

export type SetConnectedAddress = {
  type: 'SetConnectedAddress';
  connectedAddress: string | null;
};

export type UpdateConnectivity = {
  type: 'UpdateConnectivity';
  connectivity: Connectivity;
};

export type UpdateChainDetails = {
  type: 'UpdateChainDetails';
  details: ChainState;
};

export type UpdateChainAccountDetails = {
  type: 'UpdateChainAccountDetails';
  details: AccountChainState;
};

export type StoreReferendumDetails = {
  type: 'StoreReferendumDetails';
  details: Map<number, ReferendumDetails>;
};

type Offline = {
  type: 'Offline';
};

type Online = {
  type: 'Online';
};

type BaseConnected = {
  type: 'Connected' | 'Following';
  endpoints: string[];
  block: number;
};

type Connected = BaseConnected & {
  type: 'Connected';
};

type Following = BaseConnected & {
  type: 'Following';
};

export type Connectivity = Offline | Online | Connected | Following;

export const isAtLeastConnected = (
  connectivity: Connectivity
): connectivity is BaseConnected => {
  const { type } = connectivity;
  return type == 'Connected' || type == 'Following';
};

export type CastVote = {
  type: 'CastVote';
  index: number;
  vote: AccountVote;
};

export type ClearVotes = {
  type: 'ClearVotes';
};

export type SetIndexes = {
  type: 'SetIndexes';
  data: Record<string, object>;
};

export type SetDelegates = {
  type: 'SetDelegates';
  data: Array<Delegate>;
};

export type Action =
  | AddReport
  | RemoveReport
  | SetConnectedAddress
  | SetRestored
  | UpdateConnectivity
  | UpdateChainDetails
  | UpdateChainAccountDetails
  | StoreReferendumDetails
  | CastVote
  | ClearVotes
  | SetIndexes
  | SetDelegates;
