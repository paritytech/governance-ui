import React, { memo, Suspense, useEffect, useState } from "react";
import { Remark } from 'react-remark';
import { Card, Loading, Text } from "../components/common";
import { Network } from "../utils/polkadot-api";
import { fetchReferenda, Post } from "../utils/polkassembly";

const MarkdownCard = memo(({ index, title, content }: { index: number, title: string, content: string }) => {
  const isHTML = content.startsWith("<p"); // A bug in polkascan made some posts in HTML. They should always be markdown.
  return (
    <Card className="card" header={<Text h3 color="primary" className="block-ellipsis" css={{ m: "$8" }}>#{index} {title}</Text>}
      bodyCss={{ p: "$12", overflowX: "clip" }}>
      {isHTML
      ? <Text dangerouslySetInnerHTML={{__html: content}} />
      : <Remark>{content}</Remark>}
    </Card>
  );
});

const ReferendumCard = memo(({ network, index }: { network: Network, index: number }) => {
  const [details, setDetails] = useState<Post | null>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    async function fetchData() {
      try {
        const details = await fetchReferenda(network, index);
        setDetails(details.posts[0]);
      } catch {
        setError("Failed to load data");
      }
    }
    fetchData();
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      {details &&
      <MarkdownCard index={index} title={details.title} content={details.content} />}
      {error &&
      <div>{error}</div>}
    </Suspense>
  );
});

export default ReferendumCard;
