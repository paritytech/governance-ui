import { ApiPromise } from "@polkadot/api";
import type { DeriveReferendumExt } from '@polkadot/api-derive/types';

export type Proposal = {
    preImageHash: string,
    account: string,
};

export enum ReferendumState {
    Ongoing,
    Finished
}

export type ReferendumTally = {
    ayes: number,
    nays: number,
    turnout: number,
}

export type Referendum =
    | {state: ReferendumState.Ongoing, end: number, proposalHash: string, threshold: string, delay: number, tally: ReferendumTally}
    | {state: ReferendumState.Finished, approved: boolean, end: number}

export type Voting = {
    id: number,
    preImageHash: string,
    account: string,
};

export async function getPublicProposals(api: ApiPromise): Promise<Map<number, Proposal>> {
    const result = await api.query.democracy.publicProps()).toHuman();
    return new Map(result.map(prop => [prop[0].toNumber(), {preImageHash: prop[1].toHuman(), account: prop[2].toHuman()}]))
}

function asReferendum(object: any): Referendum {
    const finished = object["Finished"];
    if (finished) {
        return {state: ReferendumState.Finished, approved: finished["approved"], end: finished["end"]};
    }
    const ongoing = object["Ongoing"];
    return {state: ReferendumState.Ongoing, end: ongoing["end"], proposalHash: ongoing["proposalHash"], threshold: ongoing["threshold"], delay: ongoing["delay"], tally: {ayes: ongoing["tally"]["ayes"], nays: ongoing["tally"]["nays"], turnout: ongoing["tally"]["turnout"]}};
}

export async function getReferendum(api: ApiPromise, id: number): Promise<Referendum> {
    const result = (await api.query.democracy.referendumInfoOf(id)).toHuman();
    return asReferendum(result);
}

export async function getAllReferendums(api: ApiPromise): Promise<DeriveReferendumExt[]> {
    return api.derive.democracy.referendums();
}
