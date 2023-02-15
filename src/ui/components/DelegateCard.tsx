import { useState } from 'react';
import { Button, Card } from '../lib';
import { Accounticon } from './Accounticon';
import { DelegateModal } from './DelegateModal';

type DelegateRoleType = 'nominator' | 'validator' | 'fellow';
const tag: Record<DelegateRoleType, { title: string; twColor: string }> = {
  nominator: { title: 'nominator', twColor: 'bg-green-300' },
  validator: { title: 'validator', twColor: 'bg-lime-300' },
  fellow: { title: 'fellowship', twColor: 'bg-yellow-300' },
};
export function RoleTag({ role }: { role: DelegateRoleType }) {
  if (!tag[role]) return;
  const { title, twColor } = tag[role];
  return (
    <div
      className={`flex min-h-full min-w-[30px] items-start justify-start rounded-full px-2 py-1 ${twColor}`}
    >
      <p className="text-xs font-semibold uppercase">{title}</p>
    </div>
  );
}

export function CardStat({ stat }: { stat: { title: string; value: string } }) {
  const { title, value } = stat;
  return (
    <div className="flex flex-col items-start justify-start gap-y-1">
      <div className="leading-normal">{title}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

export function DelegateButton(delegate) {
  const [visible, setVisible] = useState(false);
  const closeModal = () => {
    setVisible(false);
  };

  const openModal = () => {
    setVisible(true);
  };

  return (
    <>
      <Button onClick={() => openModal()}>
        <div className="flex w-full flex-nowrap justify-between">
          <div>{'>'}</div>
          <div>Delegate Votes</div>
        </div>
      </Button>
      <DelegateModal open={visible} onClose={() => closeModal()} />
    </>
  );
}

export function DelegateCard({ delegate }) {
  const {
    account: { name, address },
    roles,
    bio,
    stats,
  } = delegate;
  return (
    <>
      <Card className="flex w-[500px] shrink-0 grow-0 flex-col gap-4 p-6 shadow-md">
        <div className="flex flex-col">
          <div className="flex flex-row items-center justify-between">
            <h2 className="text-xl">{name}</h2>
            <DelegateButton delegate={delegate} />
          </div>
          <Accounticon address={address} />
        </div>
        <div className="flex gap-2">
          {roles.map((role) => (
            <RoleTag key={role} role={role} />
          ))}
        </div>
        <div className="prose prose-sm leading-tight">
          <div className="uppercase leading-tight">About</div>
          <div className="">{bio}</div>
        </div>
        <hr />
        <div className="prose prose-sm flex flex-row gap-6">
          {stats.map((stat) => (
            <CardStat stat={stat} />
          ))}
        </div>
      </Card>
    </>
  );
}
