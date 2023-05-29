import { useEffect, useState } from 'react';
import BN from 'bn.js';
import { Delegate, TrackMetaData } from '../../../../lifecycle/types';
import { Conviction, SigningAccount } from '../../../../types';
import {
  useAppLifeCycle,
  extractBalance,
  extractChainInfo,
  flattenAllTracks,
} from '../../../../lifecycle';
import { useAccount, useDelegation } from '../../../../contexts';
import {
  signAndSend,
  formatConviction,
  calcDelegatableBalance,
} from '../../../../utils/polkadot-api';
import { BalanceLabel, LabeledBox, TracksLabel } from '../../common/LabeledBox';
import { SimpleAnalytics } from '../../../../analytics';
import { CloseIcon, ChevronRightIcon } from '../../../../ui/icons/index';
import { Accounticon } from '../../accounts/Accounticon';
import { Modal } from '../../../../ui/lib/Modal';
import { Button } from '../../../../ui/lib/Button';
import { ConnectButton } from '../../accounts/ConnectButton';

export function TxnModal({
  delegate,
  selectedTracks,
  open,
  onClose,
}: {
  delegate: Delegate | string;
  selectedTracks: TrackMetaData[];
  open: boolean;
  onClose: () => void;
}) {
  const { state, updater } = useAppLifeCycle();
  const { connectedAccount } = useAccount();
  const { clearTrackSelection, scrollToSection } = useDelegation();
  const [usableBalance, setUsableBalance] = useState<BN>();
  const [fee, setFee] = useState<BN>();
  const balance = extractBalance(state);
  const { unit, decimals } = extractChainInfo(state) || {};
  const delegateAddress =
    typeof delegate === 'object' ? delegate.address : delegate;
  const name = typeof delegate === 'object' ? delegate.name : null;
  const connectedAddress = connectedAccount?.account?.address;
  const conviction = Conviction.None;

  // set fee and balance
  useEffect(() => {
    if (
      open &&
      delegateAddress &&
      connectedAddress &&
      balance &&
      selectedTracks.length > 0
    ) {
      const getFees = async () => {
        const selectedTrackIds = selectedTracks.map((track) => track.id);
        const allTrackIds = Array.from(flattenAllTracks(state.tracks).keys());
        const [delegateSelectedFee, undelegateAllFee] = await Promise.all([
          updater.delegateFee(
            connectedAddress,
            delegateAddress,
            selectedTrackIds,
            balance,
            conviction
          ),
          updater.undelegateFee(connectedAddress, allTrackIds),
        ]);

        const usableBalance =
          delegateSelectedFee &&
          undelegateAllFee &&
          calcDelegatableBalance(
            balance,
            delegateSelectedFee,
            undelegateAllFee
          );

        return { fee: delegateSelectedFee, usableBalance };
      };
      getFees().then(({ fee, usableBalance }) => {
        setFee(fee);
        setUsableBalance(usableBalance);
      });
    }
  }, [open, delegateAddress, connectedAddress, balance, selectedTracks]);

  const cancelHandler = () => onClose();
  const delegateHandler = async (
    { account: { address }, signer }: SigningAccount,
    amount: BN
  ) => {
    try {
      const trackIds = selectedTracks.map((track) => track.id);
      const tx = await updater.delegate(
        delegateAddress,
        trackIds,
        amount,
        conviction
      );
      if (tx.type === 'ok') {
        await signAndSend(
          address,
          signer,
          tx.value,
          ({ status, dispatchError }) => {
            updater.handleCallResult(status);
            // clear track selection when delegation tx is finalized.
            if (status.isFinalized) {
              clearTrackSelection();
              scrollToSection('top');

              if (!dispatchError) {
                SimpleAnalytics.track('Delegate', {
                  address,
                  amount: amount.toString(),
                  tracks: trackIds.map(toString).join(','),
                });
              }
            }
          }
        );
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
              <TracksLabel
                allTracksCount={flattenAllTracks(state.tracks).size}
                tracks={selectedTracks}
                visibleCount={2}
              />
            </LabeledBox>
            <LabeledBox title="Tokens to delegate">
              <BalanceLabel
                balance={usableBalance}
                decimals={decimals}
                unit={unit}
              />
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
            <LabeledBox
              title="Conviction"
              tooltipContent={
                <p>
                  No conviction means your tokens will are only locked while
                  they are delegated. <br /> Once you unlock them, you can use
                  them again.{' '}
                </p>
              }
            >
              <div>{formatConviction(conviction)}</div>
            </LabeledBox>
          </div>
          <hr className="w-full bg-gray-400" />
          <div className="w-full">
            <LabeledBox title="Delegation fee (one time)">
              <BalanceLabel balance={fee} decimals={decimals} unit={unit} />
            </LabeledBox>
          </div>
        </div>
        <div className="flex w-full flex-row justify-end gap-4">
          <Button onClick={cancelHandler}>
            <CloseIcon />
            <div>Cancel</div>
          </Button>

          {connectedAddress ? (
            <Button
              variant="primary"
              onClick={() =>
                connectedAccount &&
                usableBalance &&
                delegateHandler(connectedAccount, usableBalance)
              }
              disabled={!connectedAccount || !usableBalance?.gtn(0)}
            >
              <div>
                {!usableBalance?.gtn(0)
                  ? 'Insufficient tokens to delegate'
                  : 'Delegate Now'}
              </div>
              <ChevronRightIcon />
            </Button>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
    </Modal>
  );
}
