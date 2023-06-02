import { SyntheticEvent, useState, useEffect, useMemo } from 'react';
import {
  Delegate,
  extractChainInfo,
  lookupDelegateByAddress,
  useAppLifeCycle,
  extractDelegatedTracks,
} from '../../../lifecycle';
import {
  extractIsProcessing,
  extractBalance,
  flattenAllTracks,
  filterUndelegatedTracks,
} from '../../../lifecycle';

import { useAccount } from '../../../contexts';
import { ConnectButton } from '../../components';
import { Accounticon } from '../../components/accounts/Accounticon';
import {
  BalanceLabel,
  LabeledBox,
  TracksLabel,
} from '../../components/common/LabeledBox';
import { TxnModal } from '../../components/delegation/delegateModal/TxnModal';
import { Remark } from 'react-remark';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Button } from '../../lib/Button';
import { ArrowRightIcon, CheckIcon, CopyIcon } from '../../icons';
import { Card } from '../../lib';
import {
  formatConviction,
  calcDelegatableBalance,
} from '../../../utils/polkadot-api';
import BN from 'bn.js';
import { Conviction } from '../../../types';
import { Link } from 'react-router-dom';

export function DelegateInfo({ delegate }: { delegate: Delegate }) {
  const { address, manifesto, name } = delegate;
  return (
    <div className="flex flex-col items-start justify-start gap-6 overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex flex-col items-start">
          <h2 className="text-xl capitalize">{name}</h2>
          <Accounticon
            address={address}
            size={24}
            textClassName="font-semibold my-2"
          />
        </div>
      </div>
      {manifesto && (
        <div className={`h-full overflow-auto text-base`}>
          <Remark>{manifesto}</Remark>
        </div>
      )}
    </div>
  );
}
export function SelectedDelegateCard({ delegate }: { delegate: Delegate }) {
  const { state, updater } = useAppLifeCycle();

  const { connectedAccount } = useAccount();
  const [txVisible, setTxVisible] = useState(false);

  const { unit, decimals } = extractChainInfo(state) || {};
  const isProcessing = extractIsProcessing(state);

  const [usableBalance, setUsableBalance] = useState<BN>();
  const [fee, setFee] = useState<BN>();

  /* Memoized states */
  // ToDo: use a set of hooks
  const allTracks = useMemo(
    () => flattenAllTracks(state.tracks),
    [state.tracks]
  );
  const undelegatedTracks = useMemo(
    () => filterUndelegatedTracks(state, allTracks),
    [state, allTracks]
  );
  const balance = useMemo(() => extractBalance(state), [state]);

  const connectedAddress = connectedAccount?.account?.address;
  const delegateAddress = delegate.address;
  const conviction = Conviction.None;
  // set fee and delegatable balance
  useEffect(() => {
    if (
      delegateAddress &&
      connectedAddress &&
      balance &&
      undelegatedTracks.length > 0
    ) {
      const getFees = async () => {
        const selectedTrackIds = undelegatedTracks.map((track) => track.id);
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
  }, [delegateAddress, connectedAddress, balance, undelegatedTracks]);

  // transaction Modal handlers
  const closeTxModal = () => {
    setTxVisible(false);
  };
  const openTxModal = () => {
    setTxVisible(true);
  };
  const delegateHandler = (e: SyntheticEvent) => {
    e.stopPropagation();
    openTxModal();
  };

  const delegatesWithTracks = extractDelegatedTracks(state);

  return (
    <>
      <div>
        <Card className="w-[445px]">
          <div className="flex w-full flex-col gap-8 p-4 md:p-6">
            <div className="flex flex-col items-start justify-start gap-6 ">
              <div className="text-left">
                <h2 className="mb-2 text-3xl font-medium">Delegate Now</h2>
              </div>
              <LabeledBox title="Your delegate">
                <div className="flex gap-2">
                  <Accounticon
                    textClassName="font-medium"
                    address={delegate.address}
                    size={24}
                  />
                </div>
              </LabeledBox>
              <LabeledBox title="Tracks to delegate">
                <TracksLabel
                  allTracksCount={flattenAllTracks(state.tracks).size}
                  tracks={undelegatedTracks}
                  visibleCount={2}
                />
              </LabeledBox>
              <div className="grid w-full grid-cols-2 gap-4">
                <LabeledBox title="Tokens to delegate">
                  <BalanceLabel
                    balance={usableBalance}
                    decimals={decimals}
                    unit={unit}
                  />
                </LabeledBox>
                <LabeledBox
                  title="Conviction"
                  tooltipContent={
                    <p>
                      No conviction means your tokens are only locked while they
                      are delegated. <br /> Once you unlock them, you can use
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
                  <BalanceLabel balance={fee} unit={unit} decimals={decimals} />
                </LabeledBox>
              </div>
            </div>
            <div className="flex w-full flex-row justify-end gap-4">
              {connectedAddress ? (
                <Button
                  className="w-full"
                  variant="primary"
                  onClick={(event) =>
                    connectedAccount && usableBalance && delegateHandler(event)
                  }
                  disabled={
                    isProcessing || !connectedAccount || !usableBalance?.gtn(0)
                  }
                >
                  <div>
                    {!usableBalance?.gtn(0)
                      ? 'Insufficient tokens to delegate'
                      : 'Delegate all undelegated tracks'}
                  </div>
                  <ArrowRightIcon />
                </Button>
              ) : (
                <ConnectButton />
              )}
            </div>
            <hr />
            <div className="flex w-full flex-col gap-2 text-sm">
              {delegatesWithTracks.size ? (
                <Link to="/" className="flex flex-row items-center gap-1">
                  <div>Manage your active delegations</div>
                  <ArrowRightIcon />
                </Link>
              ) : (
                <Link to="/" className="flex flex-row items-center gap-1">
                  <div>Discover other delegates</div>
                  <ArrowRightIcon />
                </Link>
              )}
            </div>
          </div>
        </Card>
        <TxnModal
          open={txVisible}
          onClose={closeTxModal}
          delegate={delegate}
          selectedTracks={undelegatedTracks}
        />
      </div>
    </>
  );
}

export function SelectedDelegatePanel({
  selectedDelegate,
}: {
  selectedDelegate: string;
}) {
  const { state, updater } = useAppLifeCycle();
  // lookup delegate
  let delegate =
    selectedDelegate &&
    lookupDelegateByAddress(state.delegates, selectedDelegate);
  if (!delegate) {
    delegate = {
      name: 'Anonymous',
      address: selectedDelegate,
      manifesto:
        'This delegate is not currently registered in our registry. However, you can still choose to delegate your votes to them if you trust them and have confidence in their abilities.',
    };
  }
  function generateShareLink() {
    return location.href;
  }

  const delegatesWithTracks = extractDelegatedTracks(state);
  const tracks =
    Array.from(delegatesWithTracks.entries()).find(
      ([delegate]) => delegate.address == selectedDelegate
    )?.[1] || [];

  const [copied, setCopied] = useState(false);
  const allTracksCount = flattenAllTracks(state.tracks).size;

  return (
    <div className="flex w-full max-w-[1280px] flex-row gap-32 p-8 pt-10">
      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full flex-row justify-between">
          <div className="font-unbounded text-h4">{delegate.name}</div>
          <CopyToClipboard
            text={generateShareLink()}
            onCopy={() =>
              updater.addReport({
                type: 'Info',
                message: 'Profile link copied to clipboard!',
              })
            }
          >
            <Button variant="ghost" onClick={() => setCopied(true)}>
              {copied ? <CheckIcon /> : <CopyIcon />}
              <div>{copied ? 'Copied to clipboard' : 'Copy profile link'}</div>
            </Button>
          </CopyToClipboard>
        </div>
        {tracks.length > 0 && (
          <LabeledBox title="Tracks delegated">
            <TracksLabel
              allTracksCount={allTracksCount}
              tracks={tracks}
              visibleCount={2}
            />
          </LabeledBox>
        )}
        <hr />
        <Remark>{delegate.manifesto || ''}</Remark>
      </div>
      <SelectedDelegateCard delegate={delegate} />
    </div>
  );
}
