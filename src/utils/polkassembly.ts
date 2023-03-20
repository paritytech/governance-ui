import { Network } from '../network.js';
import { ReferendumDetails } from '../types.js';
import { fetchJSON } from './http.js';
import { Result } from './index.js';

export async function fetchReferenda(
  network: Network,
  id: number
): Promise<Result<ReferendumDetails>> {
  const url = `https://api.polkassembly.io/api/v1/posts/on-chain-post?postId=${id}&proposalType=referendums_v2`;
  return await fetchJSON(url, {
    headers: { 'x-network': network.toString().toLowerCase() },
  });
}
