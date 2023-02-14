import { Button, Card } from '../lib';
import { Accounticon } from './Accounticon';

export function DelegateCard({ delegate }) {
  console.log(delegate);
  const {
    account: { name, address },
  } = delegate;
  return (
    <>
      <Card className="flex w-[500px] max-w-full flex-col p-6 shadow-md">
        <div className="flex flex-col">
          <div className="flex flex-row items-center justify-between">
            <h2 className="text-xl">{name}</h2>
            <Button>
              <div className="flex w-full flex-nowrap justify-between">
                <div>{'>'}</div>
                <div>Delegate Votes</div>
              </div>
            </Button>
          </div>
          <Accounticon address={address} />
        </div>
      </Card>
    </>
  );
}
