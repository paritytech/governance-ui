import { Loading } from '../lib/index.js';

export function LoadingPanel({ message }: { message: string }): JSX.Element {
  return (
    <div className="flex flex-col" role="progressbar" aria-busy="true">
      <Loading />
      <h1>{message}</h1>
    </div>
  );
}
