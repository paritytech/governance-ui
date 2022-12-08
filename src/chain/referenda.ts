import { ApiPromise } from "@polkadot/api";
import { CallLookup, Curve, Referendum, ReferendumSubmitted, ScheduledWakeUp, Track } from "../types";

function toReferendumSubmitted(referendum: any): ReferendumSubmitted {
  return {
    submitted: referendum[0],
    submissionDeposit: referendum[1],
    decisionDeposit: referendum[2].unwrapOr(null)
  }
}

function toCall(codec: any): CallLookup {
  try {
    const lookup = codec.asLookup;
    return {
      hash: lookup.hash,
      len: lookup.len,
    };
  } catch {
    return {
      hash: "",
      len: 0
    }
  }
}

function toScheduledWakeUp(codec: any): ScheduledWakeUp | undefined {
  if (codec.isSome) {
    const o = codec.value;
    return {
      when: o[0].toNumber(),
      address: o[1].toString(),
    };
  }
}

function toReferendum(codec: any): Referendum {
	const o = codec.unwrapOrDefault();
  if (o.isOngoing) {
    const ongoing = o.asOngoing;
    return {
      type: "ongoing",
      track: ongoing.track,
      proposal: toCall(ongoing),
      enactment: ongoing.enactment,
      inQueue: ongoing.inQueue,
      deciding: ongoing.deciding,
      tally: ongoing.tally,
      submitted: ongoing.submitted,
      submissionDeposit: ongoing.submissionDeposit,
      decisionDeposit: ongoing.decisionposit,
      alarm: toScheduledWakeUp(codec)
    };
  } else if (o.isApproved) {
    const approved = o.asApproved;
    return { type: "approved", ...toReferendumSubmitted(approved) };
  } else if (o.isRejected) {
    const rejected = o.asRejected;
    return { type: "rejected", ...toReferendumSubmitted(rejected) };
  } else if (o.isCancelled) {
    const cancelled = o.asCancelled;
    return { type: "cancelled", ...toReferendumSubmitted(cancelled) };
  } else if (o.isTimedOut) {
    const timedout = o.asTimedOut;
    return { type: "timedout", ...toReferendumSubmitted(timedout) };
  } else if (o.isKilled) {
    const killed = o.asKilled;
    return { type: "killed", submitted: killed.submitted };
  } else {
    return { type: "unknown"};
  }
}

export async function getAllReferenda(api: ApiPromise): Promise<Map<number, Referendum>> {
  return new Map((await api.query.referenda.referendumInfoFor.entries()).map(o => [o[0].toHuman()[0], toReferendum(o[1])]));
}

function toCurve(codec: any): Curve {
  if (codec.isLinearDecreasing) {
    const linearDecreasing = codec.asLinearDecreasing;
    return {
      type: "LinearDecreasing",
      length: linearDecreasing.length,
      floor: linearDecreasing.floor,
      ceil: linearDecreasing.ceil
    };
  } else if (codec.isSteppedDecreasing) {
    const steppedDecreasing = codec.asSteppedDecreasing;
    return {
      type: "SteppedDecreasing",
      begin: steppedDecreasing.begin,
      end: steppedDecreasing.end,
      step: steppedDecreasing.step,
      period: steppedDecreasing.period
    };
  } else {
    const reciprocal = codec.asReciprocal;
    return {
      type: "Reciprocal",
      factor: reciprocal.factor,
      xOffset: reciprocal.xOffset,
      yOffset: reciprocal.yOffset
    };
  }
}

function toTrack(codec: any): Track {
  return {
    name: codec.name.toString(),
    maxDeciding: codec.maxDeciding,
    decisionDeposit: codec.decisionDeposit,
    preparePeriod: codec.preparePeriod,
    decisionPeriod: codec.decisionPeriod,
    confirmPeriod: codec.confirmPeriod,
    minEnactmentPeriod: codec.minEnactmentPeriod,
    minApproval: toCurve(codec.minApproval),
    minSupport: toCurve(codec.minSupport)
  };
}

export async function getAllTracks(api: ApiPromise): Promise<Map<number, Track>> {
    return new Map(api.consts.referenda.tracks.map(o => [o[0].toHuman(), toTrack(o[1])]));
}
