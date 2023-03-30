import type { StatType, TrackType } from './types';
import { useMemo, useState } from 'react';
import { Remark } from 'react-remark';
import { ChevronRightIcon, DelegateIcon } from '../../icons';
import { Button, ButtonSecondary, Card } from '../../lib';
import { Accounticon } from '../accounts/Accounticon.js';
import type {
  Delegate,
  DelegateRoleType,
  State,
} from '../../../lifecycle/types';
import { extractDelegations, extractRoles } from '../../../lifecycle';
import { trackCategories } from '../../../chain/index';
import { DelegateModal } from './delegateModal/Delegate';
import { useDelegation } from '../../../contexts';

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

export function CardStat({ stat }: { stat: StatType }) {
  const { title, value } = stat;
  return (
    <div className="flex flex-col items-start justify-start gap-y-1">
      <div className="leading-normal">{title}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

export function StatBar({ stats }: { stats: StatType[] }) {
  return (
    <>
      {stats.length > 0 && <hr />}
      <div className="prose prose-sm flex flex-row gap-6">
        {stats.map((stat, idx) => (
          <CardStat key={idx} stat={stat} />
        ))}
      </div>
    </>
  );
}

function filterUndelegatedTracks(state: State): TrackType[] {
  const delegatedTrackIds = new Set(extractDelegations(state).keys());
  return trackCategories
    .map((track) => track.tracks)
    .flat()
    .filter((t) => !delegatedTrackIds.has(t.id));
}

function manifestoPreview(
  str: string,
  maxLen: number
): { preview: string; truncated: boolean } {
  const preview = str.substring(0, maxLen);
  const truncated = str.length > maxLen;
  return { preview, truncated };
}

export function DelegateCard({
  delegate,
  state,
  variant,
}: {
  delegate: Delegate;
  state: State;
  variant: 'all' | 'some';
}) {
  const { name, address, manifesto } = delegate;
  const roles = extractRoles(address, state);
  const { preview, truncated } = useMemo(
    () => manifestoPreview(manifesto, 200),
    [manifesto]
  );

  const [visible, setVisible] = useState(false);
  const closeModal = () => {
    setVisible(false);
  };
  const openModal = () => {
    setVisible(true);
  };
  const delegateHandler = () => openModal();

  // extract tracks
  const undelegatedTracks = filterUndelegatedTracks(state);
  const { selectedTracks } = useDelegation();
  const someTracks = trackCategories
    .map((track) => track.tracks)
    .flat()
    .filter((track) => selectedTracks.has(track.id));
  const tracks = variant === 'all' ? undelegatedTracks : someTracks;

  return (
    <>
      <Card
        className={`flex h-80 shrink-0 grow-0 flex-col gap-4 p-6 shadow-md ${
          variant === 'all' ? 'w-[420px]' : 'w-full'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col items-start">
            <h2 className="text-xl capitalize">{name}</h2>
            <Accounticon
              address={address}
              size={24}
              textClassName="font-semibold my-2"
            />
          </div>
          {variant === 'some' && (
            <ButtonSecondary onClick={delegateHandler}>
              <div className="flex w-full flex-nowrap items-center justify-center gap-1">
                <div>Select</div>
                <ChevronRightIcon />
              </div>
            </ButtonSecondary>
          )}
        </div>
        <div className="flex gap-2">
          {roles.map((role) => (
            <RoleTag key={role} role={role} />
          ))}
        </div>
        <div className="prose prose-sm grow overflow-auto text-ellipsis leading-tight">
          <Remark>{preview}</Remark>
          {truncated && <span className="text-primary">{'Read more ->'}</span>}
        </div>
        <StatBar stats={[]} />
        {variant === 'all' && (
          <Button onClick={() => openModal()}>
            <div>Delegate All Votes</div>
            <DelegateIcon />
          </Button>
        )}
      </Card>
      <DelegateModal
        open={visible}
        onClose={closeModal}
        delegate={delegate}
        tracks={tracks}
      />
    </>
  );
}
