import { request, gql } from 'graphql-request';

const polkadot = "https://polkadot.polkassembly.io/v1/graphql";
const kusama = "https://kusama.polkassembly.io/v1/graphql";

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
query getProposal($id: Int) {
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

export async function fetchProposal(id: number) {
    return request(polkadot, proposal_posts_query, {id: id});
}

export async function fetchReferendum(id: number): Promise<Referendum> {
   return request(polkadot, referendum_posts_query, {id: id});
}