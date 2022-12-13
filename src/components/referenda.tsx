import React, { memo, Suspense, useEffect, useState } from "react";
import { Remark } from 'react-remark';
import { Card, Loading, Text } from "../components/common";
import { ReferendumOngoing, Track } from "../types";
import { Network } from "../utils/polkadot-api";
import { fetchReferenda, Post } from "../utils/polkassembly";

function Header({ index, title, track }: { index: number, title: string, track: Track | undefined }): JSX.Element {
  return (
    <div style={{display: "flex", flexDirection: "column"}}>
      <Text h3 color="primary" className="block-ellipsis" css={{ m: "$8" }}>
        #{index} {title}
      </Text>
      <Text style={{textAlign: "end", marginRight: "1em", marginBottom: "1em"}} color="secondary">#{track?.name}</Text>
    </div>
  );
}

const MarkdownCard = memo(({ index, title, content, track }: { index: number, title: string, content: string, track: Track | undefined }) => {
  const isHTML = content.startsWith("<p"); // A bug in polkascan made some posts in HTML. They should always be markdown.
  return (
    <Card className="card" header={<Header index={index} title={title} track={track} />}
      bodyCss={{ p: "$12", overflowX: "clip" }}>
      <div>
        {isHTML
        ? <Text dangerouslySetInnerHTML={{__html: content}} />
        : <Remark>{content}</Remark>}
      </div>
    </Card>
  );
});

const ReferendumCard = memo(({ network, index, tracks, referendum }: { network: Network, index: number, tracks: Map<number, Track>, referendum: ReferendumOngoing }) => {
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
      <MarkdownCard index={index} title={details.title} content={details.content} track={tracks.get(referendum.track)} />}
      {error &&
      <div>{error}</div>}
    </Suspense>
  );
});

export default ReferendumCard;
