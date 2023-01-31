import { Loading, Spacer, Text } from '../ui/nextui';

export function LoadingPanel({ message }: { message: string }): JSX.Element {
  return (
    <div className="flex flex-col" role="progressbar" aria-busy="true">
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
