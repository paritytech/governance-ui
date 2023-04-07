import type { SigningAccount, VotingDelegating } from '../../../../types';

import { useState, useEffect } from 'react';
import { ChevronRightIcon, CloseIcon } from '../../../icons';
import { Modal, Button } from '../../../lib';
import {
  useAppLifeCycle,
  extractBalance,
  extractChainInfo,
  TrackMetaData,
} from '../../../../lifecycle';
import { Accounticon } from '../../accounts/Accounticon.js';
import { SimpleAnalytics } from '../../../../analytics';
import { useAccount } from '../../../../contexts';
import {
  signAndSend,
  calcEstimatedFee,
  formatBalance,
} from '../../../../utils/polkadot-api';
import { LabeledBox } from '../common/LabeledBox';
import BN from 'bn.js';

export function UndelegateModal({
  delegation,
  tracks,
  open,
  onClose,
}: {
  delegation: VotingDelegating;
  tracks: TrackMetaData[];
  decimals?: number;
  unit?: string;
  open: boolean;
  onClose: () => void;
}) {
  const [fee, setFee] = useState<BN>();
  const { state, updater } = useAppLifeCycle();
  const { connectedAccount } = useAccount();
  const connectedAddress = connectedAccount?.account?.address;
  const balance = extractBalance(state);
  const { unit, decimals } = extractChainInfo(state) || {};
  const { target: address } = delegation;
  const tracksCaption = tracks.map((track) => track.title).join(', ');
  const cancelHandler = () => onClose();
  // set fee
  useEffect(() => {
    if (open && connectedAddress && balance && tracks.length > 0) {
      const trackIds = tracks.map((track) => track.id);
      updater.undelegate(trackIds, connectedAddress).then(async (tx) => {
        if (tx.type === 'ok') {
          const fee = await calcEstimatedFee(tx.value, connectedAddress);
          setFee(fee);
        }
      });
    }
  }, [open]);

  const undelegateHandler = async ({
    account: { address },
    signer,
  }: SigningAccount) => {
    try {
      const trackIds = tracks.map((track) => track.id);
      const txs = await updater.undelegate(trackIds, address);
      if (txs.type == 'ok') {
        await signAndSend(address, signer, txs.value, (result) =>
          updater.handleCallResult(result)
        );
        SimpleAnalytics.track('Undelegate');
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
              Submitting this transaction will undelegate the following tracks:
            </p>
          </div>
          <div className="grid w-full grid-cols-2 gap-4">
            <LabeledBox title="Tracks to undelegate">
              {tracksCaption}
            </LabeledBox>
            <LabeledBox title="Delegate">
              <Accounticon
                textClassName="font-medium"
                address={address}
                size={24}
              />
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
          {connectedAccount &&
            balance && ( // Check for non-null balance?
              // TODO Probably better to allow for button to be disabled
              <Button onClick={() => undelegateHandler(connectedAccount)}>
                <div>Undelegate Tracks</div>
                <ChevronRightIcon />
              </Button>
            )}
        </div>
      </div>
    </Modal>
  );
}
