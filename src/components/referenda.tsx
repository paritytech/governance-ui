import React, { memo, useEffect, useState } from "react";
import { Remark } from 'react-remark';
import { Card } from "@nextui-org/react";
import { Loading, Text } from "../components/common";
import { Network } from "../utils/polkadot-api";
import { fetchReferendaV1, Post } from "../utils/polkassembly";
import { Referendum } from "../types";

const MarkdownCard = memo(({ index, title, content }: { index: number, title: string, content: string }) => {
  const isHTML = content.startsWith("<p"); // A bug in polkascan made some posts in HTML. They should always be markdown.
  return (
    <Card className="card">
      <Card.Header>
        <Text h3 color="#e6007a" className="block-ellipsis" css={{ m: "$8" }}>#{index} {title}</Text>
      </Card.Header>
      <Card.Divider />
      <Card.Body css={{ p: "$12", overflowX: "clip" }}>
        {isHTML
        ? <Text dangerouslySetInnerHTML={{__html: content}} />
        : <Remark>{content}</Remark>}
      </Card.Body>
      <Card.Divider />
    </Card>
  );
});
  
const ReferendumCard = memo(({ network, referendum }: { network: Network, referendum: Referendum }) => {
  const [details, setDetails] = useState<Post>();

  useEffect(() => {
    async function fetchData() {
      const details = await fetchReferendaV1(network, referendum.index);
      setDetails(details.posts[0]);
    }
    fetchData();
  }, []);

  if (details) {
    return <MarkdownCard index={referendum.index} title={details?.title || ""} content={details?.content || ""} />;
  } else {
    return <Loading />;
  }
});

export default ReferendumCard;