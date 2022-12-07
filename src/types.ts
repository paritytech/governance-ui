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

export type ReferendumOngoing = {
  type: "ongoing",
  /// The track of this referendum.
  track: number,
  /// The origin for this referendum.
//  origin: RuntimeOrigin,
  /// The hash of the proposal up for referendum.
//  proposal: Call,
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
//  alarm: Option<(Moment, ScheduleAddress)>,
};

export type ReferendumSubmitted = {
  /// The time of submission. Once `UndecidingTimeout` passes, it may be closed by anyone if
  /// `deciding` is `None`.
  submitted: number,
  /// The deposit reserved for the submission of this referendum.
  submissionDeposit: Deposit,
  /// The deposit reserved for this referendum to be decided.
  decisionposit?: Deposit,
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
