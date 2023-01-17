import { QueryableConsts, QueryableStorage } from '@polkadot/api/types';
import { StorageKey } from '@polkadot/types';
import { Option, u32 } from '@polkadot/types-codec';
import { ITuple } from '@polkadot/types-codec/types';
import type {
  FrameSupportPreimagesBounded,
  FrameSupportScheduleDispatchTime,
  PalletReferendaCurve,
  PalletReferendaDeposit,
  PalletReferendaReferendumInfoConvictionVotingTally,
  PalletReferendaTrackInfo,
} from '@polkadot/types/lookup';
import type { BN } from '@polkadot/util';
import {
  CallLookup,
  Curve,
  Deposit,
  DispatchTime,
  Referendum,
  ReferendumSubmitted,
  ScheduledWakeUp,
  Track,
} from '../types';

function toReferendumSubmitted(referendum: any): ReferendumSubmitted {
  return {
    submitted: referendum[0],
    submissionDeposit: referendum[1],
    decisionDeposit: referendum[2].unwrapOr(null),
  };
}

function toCall(o: FrameSupportPreimagesBounded): CallLookup {
  try {
    const lookup = o.asLookup;
    return {
      hash: lookup.hash.toString(),
      len: lookup.len.toNumber(),
    };
  } catch {
    return {
      hash: '',
      len: 0,
    };
  }
}

function toScheduledWakeUp(
  o: ITuple<[u32, ITuple<[u32, u32]>]>
): ScheduledWakeUp {
  return {
    when: o[0].toNumber(),
  };
}

function toDeposit(o: PalletReferendaDeposit): Deposit {
  return {
    who: o.who.toString(),
    amount: o.amount.toBn(),
  };
}

function toDispatchTime(o: FrameSupportScheduleDispatchTime): DispatchTime {
  if (o.isAfter) {
    const after = o.asAfter;
    return {
      after: after.toNumber(),
    };
  } else {
    const at = o.asAt;
    return {
      at: at.toNumber(),
    };
  }
}

function toReferendum(
  o: PalletReferendaReferendumInfoConvictionVotingTally
): Referendum {
  if (o.isOngoing) {
    const ongoing = o.asOngoing;
    const deciding = ongoing.deciding.unwrapOr(undefined);
    const decisionDeposit = ongoing.decisionDeposit.unwrapOr(undefined);
    const alarm = ongoing.alarm.unwrapOr(undefined);
    return {
      type: 'ongoing',
      track: ongoing.track.toNumber(),
      proposal: toCall(ongoing.proposal),
      enactment: toDispatchTime(ongoing.enactment),
      inQueue: ongoing.inQueue.toPrimitive(),
      deciding: deciding
        ? {
            since: deciding.since.toNumber(),
            confirming: deciding.confirming.unwrapOr(undefined)?.toNumber(),
          }
        : undefined,
      tally: ongoing.tally,
      submitted: ongoing.submitted.toNumber(),
      submissionDeposit: toDeposit(ongoing.submissionDeposit),
      decisionDeposit: decisionDeposit ? toDeposit(decisionDeposit) : undefined,
      alarm: alarm ? toScheduledWakeUp(alarm) : undefined,
    };
  } else if (o.isApproved) {
    const approved = o.asApproved;
    return { type: 'approved', ...toReferendumSubmitted(approved) };
  } else if (o.isRejected) {
    const rejected = o.asRejected;
    return { type: 'rejected', ...toReferendumSubmitted(rejected) };
  } else if (o.isCancelled) {
    const cancelled = o.asCancelled;
    return { type: 'cancelled', ...toReferendumSubmitted(cancelled) };
  } else if (o.isTimedOut) {
    const timedout = o.asTimedOut;
    return { type: 'timedout', ...toReferendumSubmitted(timedout) };
  } else if (o.isKilled) {
    const killed = o.asKilled;
    return { type: 'killed', submitted: killed.toNumber() };
  } else {
    return { type: 'unknown' };
  }
}

function toReferenda(
  referenda: [
    StorageKey<[u32]>,
    Option<PalletReferendaReferendumInfoConvictionVotingTally>
  ][]
): Map<number, Referendum> {
  return new Map(
    referenda.map((o) => {
      const key = o[0].args[0].toNumber();
      return [key, toReferendum(o[1].unwrapOrDefault())];
    })
  );
}

export async function getAllReferenda(api: {
  query: QueryableStorage<'promise'>;
}): Promise<Map<number, Referendum>> {
  return toReferenda(await api.query.referenda.referendumInfoFor.entries());
}

function toCurve(codec: PalletReferendaCurve): Curve {
  if (codec.isLinearDecreasing) {
    const linearDecreasing = codec.asLinearDecreasing;
    return {
      type: 'LinearDecreasing',
      length: linearDecreasing.length,
      floor: linearDecreasing.floor,
      ceil: linearDecreasing.ceil,
    };
  } else if (codec.isSteppedDecreasing) {
    const steppedDecreasing = codec.asSteppedDecreasing;
    return {
      type: 'SteppedDecreasing',
      begin: steppedDecreasing.begin,
      end: steppedDecreasing.end,
      step: steppedDecreasing.step,
      period: steppedDecreasing.period,
    };
  } else {
    const reciprocal = codec.asReciprocal;
    return {
      type: 'Reciprocal',
      factor: reciprocal.factor,
      xOffset: reciprocal.xOffset,
      yOffset: reciprocal.yOffset,
    };
  }
}

function toTrack(trackInfo: PalletReferendaTrackInfo): Track {
  return {
    name: trackInfo.name.toString(),
    maxDeciding: trackInfo.maxDeciding.toNumber(),
    decisionDeposit: trackInfo.decisionDeposit.toBn(),
    preparePeriod: trackInfo.preparePeriod.toNumber(),
    decisionPeriod: trackInfo.decisionPeriod.toNumber(),
    confirmPeriod: trackInfo.confirmPeriod.toNumber(),
    minEnactmentPeriod: trackInfo.minEnactmentPeriod.toNumber(),
    minApproval: toCurve(trackInfo.minApproval),
    minSupport: toCurve(trackInfo.minSupport),
  };
}

function toTracks(
  tracks?: [BN, PalletReferendaTrackInfo][]
): Map<number, Track> {
  return new Map(tracks?.map((o) => [o[0].toNumber(), toTrack(o[1])]));
}

export function getAllTracks(api: {
  consts: QueryableConsts<'promise'>;
}): Map<number, Track> {
  return toTracks(
    api.consts.referenda.tracks as unknown as [BN, PalletReferendaTrackInfo][]
  );
}
