import type { SigningAccount } from '../../../../types';

import { useState, useEffect } from 'react';
import { ChevronRightIcon, CloseIcon } from '../../../icons';
import { Modal, Button } from '../../../lib';
import {
  useAppLifeCycle,
  extractBalance,
  extractChainInfo,
  TrackMetaData,
  flattenAllTracks,
} from '../../../../lifecycle';
import { Accounticon } from '../../accounts/Accounticon.js';
import { SimpleAnalytics } from '../../../../analytics';
import { useAccount } from '../../../../contexts';
import {
  signAndSend,
  calcEstimatedFee,
  formatBalance,
} from '../../../../utils/polkadot-api';
import { LabeledBox, TracksLabel } from '../../common/LabeledBox';
import BN from 'bn.js';

export function UndelegateModal({
  address,
  tracks,
  open,
  onClose,
}: {
  address: string;
  tracks: TrackMetaData[];
  open: boolean;
  onClose: () => void;
}) {
  const [fee, setFee] = useState<BN>();
  const { state, updater } = useAppLifeCycle();
  const { connectedAccount } = useAccount();
  const connectedAddress = connectedAccount?.account?.address;
  const balance = extractBalance(state);
  const { unit, decimals } = extractChainInfo(state) || {};
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
        let before = Date.now();
        await signAndSend(
          address,
          { signer, nonce: -1 },
          txs.value,
          (result, unsub) => {
            console.debug(`Tx update: ${JSON.stringify(result)}`);

            const { status, dispatchError } = result;

            if (status.isReady) {
              before = Date.now();
            }

            updater.handleCallResult(unsub, status, dispatchError);
            if (status.isInBlock && !dispatchError) {
              SimpleAnalytics.track('Undelegate', {
                duration: (Date.now() - before).toString(),
                address,
                tracks: trackIds.map(toString).join(','),
              });
            }
          }
        );
      } else {
        updater.addReport({
          type: 'Error',
          message: txs.error.message,
        });
      }
    } catch (e) {
      console.debug('Failed to send the transaction', e);

      updater.addReport({
        type: 'Error',
        message: `Failed to send the transaction: ${e}`,
      });
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
          <div className="grid w-full grid-cols-3 gap-4">
            <LabeledBox className="col-span-2" title="Tracks to undelegate">
              <TracksLabel
                allTracksCount={flattenAllTracks(state.tracks).size}
                tracks={tracks}
                visibleCount={2}
              />
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
            <LabeledBox title="Undelegation fee (one time)">
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
            variant="primary"
            onClick={() =>
              connectedAccount && undelegateHandler(connectedAccount)
            }
            disabled={!connectedAccount || !balance?.gtn(0)}
          >
            <div>Undelegate Tracks</div>
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
