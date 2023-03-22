import BN from 'bn.js';
import { Network } from '../network.js';
import {
  AccountVote,
  Referendum,
  ReferendumDetails,
  Track,
  Voting,
} from '../types.js';

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

export type ChainState = {
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
  connectedAccount: string | null;
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
  block: number;
  chain: ChainState;
  account?: AccountChainState;
};

export type State = InitialState | RestoredState | ConnectedState;

// Actions

export type AddReportAction = {
  type: 'AddReportAction';
  report: Report;
};

export type RemoveReportAction = {
  type: 'RemoveReportAction';
  index: number;
};

export type SetRestoredAction = PersistedDataContext & {
  type: 'SetRestoredAction';
  network: Network;
};

export type SetConnectedAccountAction = {
  type: 'SetConnectedAccountAction';
  connectedAccount: Address | null;
};

export type UpdateConnectivityAction = {
  type: 'UpdateConnectivityAction';
  connectivity: Connectivity;
};

export type AddFinalizedBlockAction = {
  type: 'AddFinalizedBlockAction';
  block: number;
  chain: ChainState;
  account: AccountChainState | undefined;
  endpoints: string[];
};

export type StoreReferendumDetailsAction = {
  type: 'StoreReferendumDetailsAction';
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

export type CastVoteAction = {
  type: 'CastVoteAction';
  index: number;
  vote: AccountVote;
};

export type ClearVotesAction = {
  type: 'ClearVotesAction';
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
  | AddReportAction
  | RemoveReportAction
  | SetConnectedAccountAction
  | SetRestoredAction
  | UpdateConnectivityAction
  | AddFinalizedBlockAction
  | StoreReferendumDetailsAction
  | CastVoteAction
  | ClearVotesAction
  | SetIndexes
  | SetDelegates;
