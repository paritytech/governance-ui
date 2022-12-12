import React from "react";
import { Button, Card, Spacer, Text } from "../components/common";
import { Vote, VoteType } from "../types";

function VotesTable({ votes }: { votes: Vote[] }): JSX.Element {
  return (
    <div style={{display: "flex", flexDirection: "column"}}>
      <div style={{display: "flex", flexDirection: "column", overflow: "auto", maxHeight: "60vh", width: "30vw", alignItems: "center"}}>
      {votes.map((vote, idx) => {
        const isAye = vote.vote == VoteType.Aye;
        const color = isAye ? "success" : "warning";
        return (
          <>
            <Card key={idx} css={{ display: "table", mw: "400px" }}>
              <Text h3 b>#{vote.index}</Text>
              <Spacer y={2} />
              <Text h4 color={color}>{isAye ? "Aye" : "Naye"}</Text>
            </Card>
            <Spacer key={`spacer-${idx}`} x={1} />
          </>);
      })}
      </div>
      <Spacer y={1} />
      <Button color="primary" onPress={() => alert('Vote!!')}>Submit votes</Button>
    </div>
  );
}

export default VotesTable;
