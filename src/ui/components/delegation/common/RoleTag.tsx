import type { DelegateRoleType } from 'src/lifecycle';

const tag: Record<DelegateRoleType, { title: string; twColor: string }> = {
  nominator: { title: 'nominator', twColor: 'bg-green-300' },
  validator: { title: 'validator', twColor: 'bg-lime-300' },
  fellow: { title: 'fellowship', twColor: 'bg-yellow-300' },
};

export function RoleTag({ role }: { role: DelegateRoleType }) {
  if (!tag[role]) return <></>;
  const { title, twColor } = tag[role];
  return (
    <div
      className={`flex min-h-full min-w-[30px] items-start justify-start rounded-full px-2 py-1 ${twColor}`}
    >
      <p className="text-xs font-semibold uppercase">{title}</p>
    </div>
  );
}
