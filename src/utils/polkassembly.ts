import { fetchQuery } from './graphql';
import { Network } from './polkadot-api';

export type Post = {
  title: string;
  content: string;
};

export type Referendum = {
  posts: Array<Post>;
};

const referendum_posts_query = `
query getReferendum($id: Int) {
    posts(where: {onchain_link: {onchain_referendum_id: {_eq: $id}}}) {
      title
      content
      onchain_link {
          proposer_address
      }
      comments {
          content
          created_at
          author {
             username
          }
          replies {
             content
             author {
               username
            }
          }
       }
    }
  }`;

const open_referendum_posts_query = `
  query getReferendum($id: Int) {
      posts(where: {onchain_link: {onchain_referendumv2_id: {_eq: $id}}}) {
        title
        content
        onchain_link {
            proposer_address
        }
        comments(order_by: {created_at: asc}) {
            content
            created_at
            author {
               username
            }
            replies {
               content
               author {
                 username
              }
            }
         }
      }
  }`;

function networkUrl(network: Network): string {
  switch (network) {
    case Network.Polkadot:
      return 'https://polkadot.polkassembly.io/v1/graphql';
    case Network.Kusama:
      return 'https://kusama.polkassembly.io/v1/graphql';
  }
}

export async function fetchReferendaV1(
  network: Network,
  id: number
): Promise<Referendum> {
  return fetchQuery(networkUrl(network), referendum_posts_query, { id: id });
}

export async function fetchReferenda(
  network: Network,
  id: number
): Promise<Referendum> {
  return fetchQuery(networkUrl(network), open_referendum_posts_query, {
    id: id,
  });
}
