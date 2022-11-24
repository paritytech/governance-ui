import { request, gql } from 'graphql-request';
import { Network } from './polkadot-api';

export const proposal_posts_query = gql`
query getProposal($id: Int) {
    posts(where: {onchain_link: {onchain_proposal_id: {_eq: $id}}}) {
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

export type Post = {
   title: string,
   content: string,
};

export type Referendum = {
   posts: Array<Post>,
};

const referendum_posts_query = gql`
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

const open_referendum_posts_query = gql`
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
  switch(network) {
     case Network.Polkadot:
      return "https://polkadot.polkassembly.io/v1/graphql";
   case Network.Kusama:
      return "https://kusama.polkassembly.io/v1/graphql";
  }
}

export async function fetchProposal(network: Network, id: number) {
    return request(networkUrl(network), proposal_posts_query, {id: id});
}

export async function fetchReferendum(network: Network, id: number): Promise<Referendum> {
   return request(networkUrl(network), referendum_posts_query, {id: id});
}

export async function fetchOpenReferendum(network: Network, id: number): Promise<Referendum> {
   return request(networkUrl(network), open_referendum_posts_query, {id: id});
}