import { ApiPromise } from "@polkadot/api";
import { StorageEntryBaseAt } from "@polkadot/api/types";
import { Referendum, ReferendumSubmitted } from "src/types";

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

async function asReferendaMap(storage: StorageEntryBaseAt<any, any, any>) {
  return new Map((await storage.entries()).map(prop => {
    console.log("prop", prop, prop[0])
    const index = prop[0].toHuman()[0];
    return [index, toReferendum(prop[1])];
  }));
}

export async function getAllReferenda(api: ApiPromise): Promise<Map<number, Referendum>> {
  console.log("getAllReferenda", await asReferendaMap(api.query.referenda.referendumInfoFor))
    return await asReferendaMap(api.query.referenda.referendumInfoFor);
}
