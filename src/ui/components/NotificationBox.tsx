import React, { useEffect } from 'react';
import { useAppLifeCycle } from '../../lifecycle';
import { Loading } from '../lib';
import { CloseIcon } from '../icons';
import { Report } from '../../lifecycle';

const TRANSIENT_DISPLAY_TIME_MS = 3000; //milliseconds

function Notification({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-sd backdrop-blur-sd  z-50 flex w-full animate-[slideInRight_ease-out_0.23s] gap-2 bg-[rgba(0,0,0,0.85)] p-4 text-body-2 text-white ">
      {children}
    </div>
  );
}

export function NotificationBox() {
  const { state, updater } = useAppLifeCycle();
  const reports = state?.reports || [];
  const processing = state?.processingReport;
  const removeReport = (index: number) => updater?.removeReport(index);
  const resetProcessing = () => updater?.setProcessingReport(undefined);
  const current = reports?.at(0);
  const removeCurrent = () => {
    if (current) {
      removeReport(0);
    }
  };

  function isTransientReport(report: Report) {
    return report.type === 'Info' || report.type === 'Warning';
  }

  useEffect(() => {
    if (current && isTransientReport(current)) {
      setTimeout(() => {
        removeCurrent();
      }, TRANSIENT_DISPLAY_TIME_MS);
    }
  }, [current]);

  useEffect(() => {
    if (processing?.isTransient) {
      setTimeout(() => {
        resetProcessing();
      }, TRANSIENT_DISPLAY_TIME_MS);
    }
  }, [processing]);

  return (
    <div className="fixed bottom-12 right-4 z-50 flex w-[300px] flex-col gap-2">
      {current && current.type == 'Error' && (
        <Notification>
          <span className="w-full">{current.message}</span>
          {!isTransientReport && (
            <div onClick={removeCurrent}>
              <CloseIcon />
            </div>
          )}
        </Notification>
      )}
      {processing && (
        <Notification>
          {!processing.isTransient && <Loading size="xs" />}
          <span className="w-full">{processing.message}</span>
        </Notification>
      )}
    </div>
  );
}
