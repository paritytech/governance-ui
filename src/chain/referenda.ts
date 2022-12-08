import { ApiPromise } from "@polkadot/api";
import { Curve, Referendum, ReferendumSubmitted, Track } from "../types";

function toReferendumSubmitted(referendum: any): ReferendumSubmitted {
  return {
    submitted: referendum[0],
    submissionDeposit: referendum[1],
    decisionposit: referendum[2]
  }
}

function toReferendum(codec: any): Referendum {
	const o = codec.toHuman();
  const { Ongoing, Approved, Rejected, Cancelled, Timedout, Killed } = o;
  if (Ongoing) {
    return {
      type: "ongoing",
      track: Ongoing["track"],
      enactment: Ongoing["enactment"],
      inQueue: Ongoing["inQueue"],
      deciding: Ongoing["deciding"],
      tally: Ongoing["tally"],
      ...toReferendumSubmitted(Ongoing)
    };
  } else if (Killed) {
    return { type: "killed", submitted: Killed[0] };
  } else {
    const type = Approved ? "approved" : Rejected ? "rejected" : Cancelled ? "cancelled" : Timedout ? "timedout" : "unknown";
    return { type, ...toReferendumSubmitted(o)};
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
