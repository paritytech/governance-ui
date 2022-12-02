import React from "react";
import { Card } from "@nextui-org/react";
import { Spacer, Text } from "../components/common";
import { Vote } from "../types";

function VotesTable({ votes }: { votes: Vote[] }): JSX.Element {
  return (
    <div>
    {votes.map((vote, idx) => {
      const color = vote.vote ? "success" : "warning";
      return (
        <>
          <Card key={idx} variant="bordered" css={{ mw: "400px" }}>
            <Card.Body style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
              <Text h3 b>#{vote.referendum.index}</Text>
              <Spacer y={2} />
              <Text h4 color={color}>{vote.vote ? "Aye" : "Naye"}</Text>
            </Card.Body>
          </Card>
          <Spacer key={`spacer-${idx}`} x={1} />
        </>);
    })}
    </div>
  );
}

export default VotesTable;