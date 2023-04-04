import type { TrackType } from '../types';
import type { SigningAccount } from '../../../../types';

import BN from 'bn.js';
import { useEffect, useState } from 'react';
import { ChevronRightIcon, CloseIcon } from '../../../icons';
import { Modal, Button } from '../../../lib';
import {
  useAppLifeCycle,
  extractBalance,
  extractChainInfo,
} from '../../../../lifecycle';
import { Delegate } from '../../../../lifecycle/types';
import { Accounticon } from '../../accounts/Accounticon.js';
import { Conviction } from '../../../../types';
import { SimpleAnalytics } from '../../../../analytics';
import { useAccount } from '../../../../contexts';
import {
  signAndSend,
  calcEstimatedFee,
  formatBalance,
} from '../../../../utils/polkadot-api';
import { LabeledBox } from '../common/LabeledBox';

export function DelegateModal({
  delegate,
  tracks,
  open,
  onClose,
}: {
  delegate: Delegate | string;
  tracks: TrackType[];
  open: boolean;
  onClose: () => void;
}) {
  const { state, updater } = useAppLifeCycle();
  const { connectedAccount } = useAccount();
  const [usableBalance, setUsableBalance] = useState<BN>();
  const [fee, setFee] = useState<BN>();
  const balance = extractBalance(state);
  const { unit, decimals } = extractChainInfo(state) || {};
  const delegateAddress =
    typeof delegate === 'object' ? delegate.address : delegate;
  const name = typeof delegate === 'object' ? delegate.name : null;
  const tracksCaption = tracks
    .slice(0, 2)
    .map((track) => track.title)
    .join(', ');
  const remainingCount = Math.max(tracks.length - 2, 0);

  const connectedAddress = connectedAccount?.account?.address;

  useEffect(() => {
    if (
      open &&
      delegateAddress &&
      connectedAddress &&
      balance &&
      tracks.length > 0
    ) {
      // Use a default conviction voting for now
      updater
        .delegate(
          delegateAddress,
          tracks.map((track) => track.id),
          balance,
          Conviction.None
        )
        .then(async (tx) => {
          if (tx.type === 'ok') {
            const fee = await calcEstimatedFee(tx.value, connectedAddress);
            // usable balance is calculated as (balance - 3 * fees), to leave enough balance in account for undelegate tx fees.
            const usableBalance = BN.max(balance.sub(fee.muln(3)), new BN(0));
            setFee(fee);
            setUsableBalance(usableBalance);
          }
        });
    }
  }, [open]);

  const cancelHandler = () => onClose();
  const delegateHandler = async (
    { account: { address }, signer }: SigningAccount,
    amount: BN
  ) => {
    try {
      const trackIds = tracks.map((track) => track.id);
      const tx = await updater.delegate(
        delegateAddress,
        trackIds,
        amount,
        Conviction.None
      );
      if (tx.type === 'ok') {
        await signAndSend(address, signer, tx.value, (result) =>
          updater.handleCallResult(result)
        );
        SimpleAnalytics.track('Delegate');
      }
    } finally {
      // close modal
      onClose();
    }
  };
  return (
    <Modal size="md" open={open} onClose={() => onClose()}>
      <div className="flex w-full flex-col gap-12 p-4 md:p-12">
        <div className="flex flex-col items-start justify-start gap-6 ">
          <div className="text-left">
            <h2 className="mb-2 text-3xl font-medium">Summary</h2>
            <p className="text-base">
              Submitting this transaction will delegate your voting power to{' '}
              <b>{name || delegateAddress}</b> for the following tracks:
            </p>
          </div>
          <div className="grid w-full grid-cols-3 grid-rows-2 gap-4">
            <LabeledBox className="col-span-2" title="Tracks to delegate">
              <div>
                {tracksCaption}
                {!!remainingCount && (
                  <>
                    {' and'} <a>{`${remainingCount} more`}</a>
                  </>
                )}
              </div>
            </LabeledBox>
            <LabeledBox title="Tokens to delegate">
              <div>
                {(usableBalance &&
                  unit &&
                  decimals &&
                  formatBalance(usableBalance, decimals, unit)) ||
                  '...'}
              </div>
            </LabeledBox>
            <LabeledBox className="col-span-2" title="Your delegate">
              <div className="flex gap-2">
                <Accounticon
                  textClassName="font-medium"
                  address={delegateAddress}
                  size={24}
                />
              </div>
            </LabeledBox>
            <LabeledBox title="Conviction">
              <div>x0.01</div>
            </LabeledBox>
          </div>
          <hr className="w-full bg-gray-400" />
          <div className="w-full">
            <LabeledBox title="Delegation fee (one time)">
              {(unit &&
                decimals &&
                fee &&
                formatBalance(fee, decimals, unit)) ||
                '...'}
            </LabeledBox>
          </div>
        </div>
        <div className="flex w-full flex-row justify-end gap-4">
          <Button onClick={cancelHandler}>
            <CloseIcon />
            <div>Cancel</div>
          </Button>

          <Button
            onClick={() =>
              connectedAccount &&
              usableBalance?.gtn(0) &&
              delegateHandler(connectedAccount, usableBalance)
            }
            disabled={!connectedAccount || !usableBalance?.gtn(0)}
          >
            <div>Delegate Now</div>
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
