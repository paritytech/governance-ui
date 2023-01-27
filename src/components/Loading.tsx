import { Loading, Spacer, Text } from '../ui/nextui/index.js';

export function LoadingPanel({ message }: { message: string }): JSX.Element {
  return (
    <div className="flex flex-col">
      <Loading />
      <Spacer y={2} />
      <Text
        h1
        size={60}
        css={{
          textAlign: 'center',
        }}
      >
        {message}
      </Text>
    </div>
  );
}
