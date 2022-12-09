import BN from 'bn.js';

export enum VoteType {
  Aye,
  Nay
}

export type Vote = {
  vote: VoteType,
  index: number,
  referendum: Referendum
}

export type Tally = {
  ayes: number,
  nays: number,
  support: number
}

export type Deposit = {
  who: string,
  amount: number,
}

export type DecidingStatus = {
  since: number,
  confirming?: number,
}

export type DispatchTime = {
  after: number,
}

export type CallLookup = {
  hash: string,
  len: number,
}

export type ScheduledWakeUp = {
  when: number,
  address: string,
}

export type ReferendumOngoing = {
  type: "ongoing",
  /// The track of this referendum.
  track: number,
  /// The origin for this referendum.
//  origin: RuntimeOrigin,
  /// The hash of the proposal up for referendum.
  proposal: CallLookup,
  /// The time the proposal should be scheduled for enactment.
  enactment: DispatchTime,
  /// The time of submission. Once `UndecidingTimeout` passes, it may be closed by anyone if
  /// `deciding` is `None`.
  submitted: number,
  /// The deposit reserved for the submission of this referendum.
  submissionDeposit: Deposit,
  /// The deposit reserved for this referendum to be decided.
  decisionDeposit?: Deposit,
  /// The status of a decision being made. If `None`, it has not entered the deciding period.
  deciding: DecidingStatus,
  /// The current tally of votes in this referendum.
  tally: Tally,
  /// Whether we have been placed in the queue for being decided or not.
  inQueue: boolean,
  /// The next scheduled wake-up, if `Some`.
  alarm?: ScheduledWakeUp,
};

export type ReferendumSubmitted = {
  /// The time of submission. Once `UndecidingTimeout` passes, it may be closed by anyone if
  /// `deciding` is `None`.
  submitted: BN,
  /// The deposit reserved for the submission of this referendum.
  submissionDeposit: Deposit,
  /// The deposit reserved for this referendum to be decided.
  decisionDeposit?: Deposit,
};

export type ReferendumApproved = ReferendumSubmitted & { type: "approved" };
export type ReferendumRejected = ReferendumSubmitted & { type: "rejected" };
export type ReferendumCancelled = ReferendumSubmitted & { type: "cancelled" };
export type ReferendumTimedOut = ReferendumSubmitted & { type: "timedout" };

export type ReferendumKilled = {
  type: "killed",
  submitted: number,
};

export type ReferendumUnknown = { type: "unknown" };

export type Referendum =
  | ReferendumOngoing
  | ReferendumApproved
  | ReferendumRejected
  | ReferendumCancelled
  | ReferendumTimedOut
  | ReferendumKilled
  | ReferendumUnknown;

export type Perbill = {
  value: number,
};

export type LinearDecreasingCurve = {
  type: "LinearDecreasing",
  length: Perbill,
  floor: Perbill,
  ceil: Perbill,
};

export type SteppedDecreasing = {
  type: "SteppedDecreasing",
  begin: Perbill,
  end: Perbill,
  step: Perbill,
  period: Perbill,
};

export type Reciprocal = {
  type: "Reciprocal",
  factor: BN,
  xOffset: BN,
  yOffset: BN,
};

export type Curve =
  | LinearDecreasingCurve
  | SteppedDecreasing
  | Reciprocal;

// @see https://github.com/paritytech/substrate/blob/master/frame/referenda/src/types.rs#L117
export type Track = {
  /// Name of this track.
  name: string,
  /// A limit for the number of referenda on this track that can be being decided at once.
  /// For Root origin this should generally be just one.
  maxDeciding: number,
  /// Amount that must be placed on deposit before a decision can be made.
  decisionDeposit: number,
  /// Amount of time this must be submitted for before a decision can be made.
  preparePeriod: number,
  /// Amount of time that a decision may take to be approved prior to cancellation.
  decisionPeriod: number,
  /// Amount of time that the approval criteria must hold before it can be approved.
  confirmPeriod: number,
  /// Minimum amount of time that an approved proposal must be in the dispatch queue.
  minEnactmentPeriod: number,
  /// Minimum aye votes as percentage of overall conviction-weighted votes needed for
  /// approval as a function of time into decision period.
  minApproval: Curve,
  /// Minimum pre-conviction aye-votes ("support") as percentage of overall population that is
  /// needed for approval as a function of time into decision period.
  minSupport: Curve,
}
