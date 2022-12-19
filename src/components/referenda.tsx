import React, { memo, Suspense, useEffect, useState } from 'react';
import { Remark } from 'react-remark';
import { useSprings, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { Card, Loading, Text } from '../components/common';
import { ReferendumOngoing, Track, VoteType } from '../types';
import { Network } from '../utils/polkadot-api';
import { fetchReferenda, Post } from '../utils/polkassembly';
import styles from '../../assets/referenda.module.css';

function Header({
  index,
  title,
  track,
}: {
  index: number;
  title: string;
  track: Track | undefined;
}): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Text h3 color="primary" className="block-ellipsis" css={{ m: '$8' }}>
        #{index} {title}
      </Text>
      <Text
        style={{ textAlign: 'end', marginRight: '1em', marginBottom: '1em' }}
        color="secondary"
      >
        #{track?.name}
      </Text>
    </div>
  );
}

const MarkdownCard = memo(
  ({
    index,
    title,
    content,
    track,
  }: {
    index: number;
    title: string;
    content: string;
    track: Track | undefined;
  }) => {
    const isHTML = content.startsWith('<p'); // A bug in polkascan made some posts in HTML. They should always be markdown.
    return (
      <Card
        className={styles.card}
        header={<Header index={index} title={title} track={track} />}
      >
        <div>
          {isHTML ? (
            <Text dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <Remark>{content}</Remark>
          )}
        </div>
      </Card>
    );
  }
);

const ReferendumCard = memo(
  ({
    network,
    index,
    tracks,
    referendum,
  }: {
    network: Network;
    index: number;
    tracks: Map<number, Track>;
    referendum: ReferendumOngoing;
  }) => {
    const [details, setDetails] = useState<Post | null>();
    const [error, setError] = useState<string>();

    useEffect(() => {
      async function fetchData() {
        try {
          const details = await fetchReferenda(network, index);
          setDetails(details.posts[0]);
        } catch {
          setError('Failed to load data');
        }
      }
      fetchData();
    }, []);

    return (
      <Suspense fallback={<Loading />}>
        {details && (
          <MarkdownCard
            index={index}
            title={details.title}
            content={details.content}
            track={tracks.get(referendum.track)}
          />
        )}
        {error && <div>{error}</div>}
      </Suspense>
    );
  }
);

// These two are just helpers, they curate spring data, values that are later being interpolated into css
const to = (i: number) => ({
  x: 0,
  y: 0,
  scale: 1,
  delay: i * 100,
});

const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });
// This is being used down there in the view, it interpolates rotation and scale into a css transform

export function ReferendumDeck({
  network,
  tracks,
  referenda,
  voteOn,
}: {
  network: Network;
  tracks: Map<number, Track>;
  referenda: Map<number, ReferendumOngoing>;
  voteOn: (index: number, vote: VoteType) => void;
}): JSX.Element {
  const [gone] = useState(() => new Set()); // The set flags all the cards that are flicked out
  const [props, api] = useSprings(referenda.size, (i) => ({
    ...to(i),
    from: from(i),
  })); // Create a bunch of springs using the helpers above
  // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity
  const bind = useDrag(
    ({
      args: [index],
      active,
      movement: [mx],
      direction: [xDir],
      velocity: [vx],
    }) => {
      const trigger = vx > 0.5; // If you flick hard enough it should trigger the card to fly out
      if (!active && trigger) gone.add(index); // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
      api.start((i) => {
        if (index !== i) return; // We're only interested in changing spring-data for the current spring
        const isGone = gone.has(index);
        if (isGone) {
          voteOn(
            Array.from(referenda.entries())[i][0],
            xDir == 1 ? VoteType.Aye : VoteType.Nay
          );
        }
        const x = isGone ? (200 + window.innerWidth) * xDir : active ? mx : 0; // When a card is gone it flys out left or right, otherwise goes back to zero
        const rot = mx / 100 + (isGone ? xDir * 10 * vx : 0); // How much the card tilts, flicking it harder makes it rotate faster
        const scale = active ? 1 : 1; // Active cards lift up a bit
        return {
          x,
          rot,
          scale,
          delay: undefined,
          config: { friction: 50, tension: active ? 800 : isGone ? 200 : 500 },
        };
      });
      if (!active && gone.size === referenda.size)
        setTimeout(() => {
          gone.clear();
          api.start((i) => to(i));
        }, 600);
    }
  );

  // Now we're just mapping the animated values to our view, that's it. Btw, this component only renders once. :-)
  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        gridTemplateAreas: 'inner-div',
      }}
    >
      {props.map(({ x, y }, i) => (
        <animated.div
          key={i}
          style={{ width: '100%', gridArea: 'inner-div', x, y }}
        >
          {/* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */}
          <animated.div {...bind(i)}>
            <ReferendumCard
              network={network}
              index={i}
              tracks={tracks}
              referendum={Array.from(referenda.entries())[i][1]}
            />
          </animated.div>
        </animated.div>
      ))}
    </div>
  );
}

export default ReferendumCard;
