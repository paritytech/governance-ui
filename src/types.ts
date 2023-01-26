import BN from 'bn.js';

export type Vote = {
  aye: boolean;
  conviction: Conviction;
};

export type Tally = {
  ayes: BN;
  nays: BN;
  support: BN;
};

export type Deposit = {
  who: string;
  amount: BN;
};

export type DecidingStatus = {
  since: number;
  confirming?: number;
};

export type AtDispatchTime = {
  at: number;
};

export type AfterDispatchTime = {
  after: number;
};

export type DispatchTime = AtDispatchTime | AfterDispatchTime;

export type CallLookup = {
  hash: string;
  len: number;
};

export type ScheduledWakeUp = {
  when: number;
};

export type ReferendumOngoing = {
  type: 'ongoing';
  /// The track of this referendum.
  trackIndex: number;
  /// The origin for this referendum.
  //  origin: RuntimeOrigin,
  /// The hash of the proposal up for referendum.
  proposal: CallLookup;
  /// The time the proposal should be scheduled for enactment.
  enactment: DispatchTime;
  /// The time of submission. Once `UndecidingTimeout` passes, it may be closed by anyone if
  /// `deciding` is `None`.
  submitted: number;
  /// The deposit reserved for the submission of this referendum.
  submissionDeposit: Deposit;
  /// The deposit reserved for this referendum to be decided.
  decisionDeposit?: Deposit;
  /// The status of a decision being made. If `None`, it has not entered the deciding period.
  deciding?: DecidingStatus;
  /// The current tally of votes in this referendum.
  tally: Tally;
  /// Whether we have been placed in the queue for being decided or not.
  inQueue: boolean;
  /// The next scheduled wake-up, if `Some`.
  alarm?: ScheduledWakeUp;
};

export type ReferendumSubmitted = {
  /// The time of submission. Once `UndecidingTimeout` passes, it may be closed by anyone if
  /// `deciding` is `None`.
  submitted: BN;
  /// The deposit reserved for the submission of this referendum.
  submissionDeposit: Deposit;
  /// The deposit reserved for this referendum to be decided.
  decisionDeposit?: Deposit;
};

export type ReferendumApproved = ReferendumSubmitted & { type: 'approved' };
export type ReferendumRejected = ReferendumSubmitted & { type: 'rejected' };
export type ReferendumCancelled = ReferendumSubmitted & { type: 'cancelled' };
export type ReferendumTimedOut = ReferendumSubmitted & { type: 'timedout' };

export type ReferendumKilled = {
  type: 'killed';
  submitted: number;
};

export type Referendum =
  | ReferendumOngoing
  | ReferendumApproved
  | ReferendumRejected
  | ReferendumCancelled
  | ReferendumTimedOut
  | ReferendumKilled
  | Unknown;

export type Post = {
  title: string;
  content: string;
};

export type ReferendumDetails = {
  posts: Array<Post>;
};

export type PriorLock = {
  block: number;
  balance: BN;
};

export type Delegations = {
  /// The number of votes (this is post-conviction).
  votes: BN;
  /// The amount of raw capital, used for the support.
  capital: BN;
};

export enum Conviction {
  /// 0.1x votes, unlocked.
  None,
  /// 1x votes, locked for an enactment period following a successful vote.
  Locked1x,
  /// 2x votes, locked for 2x enactment periods following a successful vote.
  Locked2x,
  /// 3x votes, locked for 4x...
  Locked3x,
  /// 4x votes, locked for 8x...
  Locked4x,
  /// 5x votes, locked for 16x...
  Locked5x,
  /// 6x votes, locked for 32x...
  Locked6x,
}

export type VotingDelegating = {
  type: 'delegating';
  /// The amount of balance delegated.
  balance: BN;
  /// The account to which the voting power is delegated.
  target: string;
  /// The conviction with which the voting power is delegated. When this gets undelegated, the
  /// relevant lock begins.
  conviction: Conviction;
  /// The total amount of delegations that this account has received, post-conviction-weighting.
  delegations: Delegations;
  /// Any pre-existing locks from past voting/delegating activity.
  prior: PriorLock;
};

/// A standard vote, one-way (approve or reject) with a given amount of conviction.
export type AccountVoteStandard = {
  type: 'standard';
  vote: Vote;
  balance: BN;
};

export type AccountVoteSplit = {
  type: 'split';
  aye: BN;
  nay: BN;
};

export type AccountVoteSplitAbstain = {
  type: 'splitAbstain';
  aye: BN;
  nay: BN;
  abstain: BN;
};

export type AccountVote =
  | AccountVoteStandard
  | AccountVoteSplit
  | AccountVoteSplitAbstain;

export type VotingCasting = {
  type: 'casting';
  /// The current votes of the account.
  votes: Map<number, AccountVote>;
  /// The total amount of delegations that this account has received, post-conviction-weighting.
  delegations: Delegations;
  /// Any pre-existing locks from past voting/delegating activity.
  prior: PriorLock;
};

export type Unknown = { type: 'unknown' };

export type Voting = VotingDelegating | VotingCasting | Unknown;

export type Perbill = BN;

export type LinearDecreasingCurve = {
  type: 'LinearDecreasing';
  length: Perbill;
  floor: Perbill;
  ceil: Perbill;
};

export type SteppedDecreasing = {
  type: 'SteppedDecreasing';
  begin: Perbill;
  end: Perbill;
  step: Perbill;
  period: Perbill;
};

export type Reciprocal = {
  type: 'Reciprocal';
  factor: BN;
  xOffset: BN;
  yOffset: BN;
};

export type Curve = LinearDecreasingCurve | SteppedDecreasing | Reciprocal;

// @see https://github.com/paritytech/substrate/blob/master/frame/referenda/src/types.rs#L117
export type Track = {
  /// Name of this track.
  name: string;
  /// A limit for the number of referenda on this track that can be being decided at once.
  /// For Root origin this should generally be just one.
  maxDeciding: number;
  /// Amount that must be placed on deposit before a decision can be made.
  decisionDeposit: BN;
  /// Amount of time this must be submitted for before a decision can be made.
  preparePeriod: number;
  /// Amount of time that a decision may take to be approved prior to cancellation.
  decisionPeriod: number;
  /// Amount of time that the approval criteria must hold before it can be approved.
  confirmPeriod: number;
  /// Minimum amount of time that an approved proposal must be in the dispatch queue.
  minEnactmentPeriod: number;
  /// Minimum aye votes as percentage of overall conviction-weighted votes needed for
  /// approval as a function of time into decision period.
  minApproval: Curve;
  /// Minimum pre-conviction aye-votes ("support") as percentage of overall population that is
  /// needed for approval as a function of time into decision period.
  minSupport: Curve;
};
