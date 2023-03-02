import { useState } from 'react';
import { Card, Modal, ButtonOutline } from '../../../lib';
import { TrackSelect } from '../TrackSelect';
import { delegatesMock } from '../../../../chain/mocks';
import { DelegateCard } from '../DelegateCard';
import { Accounticon } from '../../accounts/Accounticon';

export function TrackSelection({ isCollapsed }: { isCollapsed: boolean }) {
  const [collapsed, setCollapsed] = useState(!!isCollapsed);
  return (
    <>
      <Card className="flex flex-col gap-2 px-4">
        <div className="flex h-11 w-full flex-row items-center justify-between">
          <h2 className="font-semibold">
            {collapsed ? 'Selected tracks' : 'Select Tracks to delegate'}
          </h2>
          {collapsed && (
            <ButtonOutline
              className="min-w-[100px]"
              onClick={() => setCollapsed(false)}
            >
              Edit
            </ButtonOutline>
          )}
        </div>
        {collapsed ? (
          <div>Small Tipper</div>
        ) : (
          <>
            <TrackSelect />
            <ButtonOutline onClick={() => setCollapsed(true)}>
              Save
            </ButtonOutline>
          </>
        )}
      </Card>
    </>
  );
}

export function DelegateSelection({ isCollapsed }: { isCollapsed: boolean }) {
  const [collapsed, setCollapsed] = useState(!!isCollapsed);
  const [selectedDelegate, setSelectedDelegate] = useState(delegatesMock[0]);
  const delegates = delegatesMock;
  const {
    account: { name, address },
  } = selectedDelegate;

  return (
    <>
      <Card className="flex flex-col gap-2 px-4">
        <div className="flex h-11 w-full flex-row items-center justify-between">
          <h2 className="font-semibold">
            {collapsed ? 'Selected delegate' : 'Select your delegate'}
          </h2>
          {collapsed && (
            <ButtonOutline
              className="min-w-[100px]"
              onClick={() => setCollapsed(false)}
            >
              Edit
            </ButtonOutline>
          )}
        </div>
        {collapsed ? (
          <div>
            <div>{name || address}</div>
            <Accounticon address={address} size={13} />
          </div>
        ) : (
          <>
            <div className="flex max-h-[400px] w-full flex-row flex-wrap justify-center overflow-y-auto">
              {delegates.map((del, idx) => (
                <DelegateCard
                  key={idx}
                  delegate={del}
                  delegateHandler={() => {
                    setSelectedDelegate(del);
                    setCollapsed(true);
                  }}
                />
              ))}
            </div>
            <ButtonOutline onClick={() => setCollapsed(true)}>
              Save
            </ButtonOutline>
          </>
        )}
      </Card>
    </>
  );
}

interface IDelegateModalProps {
  open: boolean;
  onClose: () => void;
}
export function DelegateModal({ open, onClose }: IDelegateModalProps) {
  return (
    <Modal size="xl" open={open} onClose={onClose}>
      <div className="h-[700px] max-h-screen w-full">
        <TrackSelection isCollapsed />
        <DelegateSelection isCollapsed />
      </div>
    </Modal>
  );
}
