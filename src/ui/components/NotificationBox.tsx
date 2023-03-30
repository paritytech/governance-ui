import { useAppLifeCycle } from '../../lifecycle';
import { CloseIcon } from '../icons';
import { Card } from '../lib/index.js';

const TRANSIENT_DISPLAY_TIME_MS = 3000; //milliseconds

export function NotificationBox(): JSX.Element {
  const { state, updater } = useAppLifeCycle();
  const reports = state?.reports || [];
  const removeReport = (index: number) => updater?.removeReport(index);
  const current = reports?.at(0);
  const removeCurrent = () => {
    if (current) {
      removeReport(0);
    }
  };
  const isTransient = false;

  if (isTransient) {
    setTimeout(() => {
      removeCurrent();
    }, TRANSIENT_DISPLAY_TIME_MS);
  }

  return (
    <>
      {current && (
        <div className="fixed bottom-12 right-4 z-50 flex w-[30%] animate-[slideInRight_ease-out_0.23s] gap-4 rounded-md bg-[rgba(0,0,0,0.7)] p-4 text-body-2 text-white backdrop-blur-md ">
          <span className="w-full">{current.message}</span>
          {!isTransient && (
            <div onClick={removeCurrent}>
              <CloseIcon />
            </div>
          )}
        </div>
      )}
    </>
  );
}
