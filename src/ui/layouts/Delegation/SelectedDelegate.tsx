import { SyntheticEvent, useState } from 'react';
import {
  Delegate,
  lookupDelegateByAddress,
  useAppLifeCycle,
} from '../../../lifecycle';
import {
  extractIsProcessing,
  flattenAllTracks,
  filterUndelegatedTracks,
  extractDelegatedTracks,
} from '../../../lifecycle';
import { useAccount } from '../../../contexts';

import { Accounticon } from '../../components/accounts/Accounticon';
import { Remark } from 'react-remark';
import { Button } from '../../lib/Button';
import { DelegateIcon } from '../../icons';
import { Card } from '../../lib';
import { TxnModal } from '../../components/delegation/delegateModal/TxnModal';
import { ActiveDelegates } from '../../components/ActiveDelegates';

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

export function SelectedDelegate({
  selectedDelegate,
}: {
  selectedDelegate: string | undefined;
}) {
  const { state } = useAppLifeCycle();

  // A map of delegates with asociated tracks. Empty if no tracks are currently delegated.
  const delegatesWithTracks = extractDelegatedTracks(state);

  // lookup delegate
  let delegate =
    selectedDelegate &&
    lookupDelegateByAddress(state.delegates, selectedDelegate);
  if (!delegate) {
    delegate = {
      name: 'Anonymous',
      address: selectedDelegate || 'undefined',
      manifesto: 'Not registered',
    };
  }
  const isProcessing = extractIsProcessing(state);

  const { connectedAccount } = useAccount();
  const [txVisible, setTxVisible] = useState(false);

  const connectedAddress = connectedAccount?.account?.address;

  // extract tracks yet to be delegated
  const allTracks = flattenAllTracks(state.tracks);
  const selectedTracks = filterUndelegatedTracks(state, allTracks);

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
  return (
    <>
      <div>
        <Card className="mt-8 flex h-[540px] max-h-[60vh] w-[740px] max-w-full flex-col">
          <div className="flex h-full w-full flex-col p-4 md:p-12">
            <DelegateInfo delegate={delegate} />
            <div className="my-4 grow" />
            <div className="flex flex-row justify-end">
              <Button
                variant="primary"
                onClick={delegateHandler}
                disabled={isProcessing || !connectedAddress}
              >
                <div>Delegate all tracks</div>
                <DelegateIcon />
              </Button>
            </div>
          </div>
        </Card>
        <TxnModal
          open={txVisible}
          onClose={closeTxModal}
          delegate={delegate}
          selectedTracks={selectedTracks}
        />
      </div>
      {!!delegatesWithTracks.size && (
        <ActiveDelegates
          delegatesWithTracks={delegatesWithTracks}
          state={state}
        />
      )}
    </>
  );
}
