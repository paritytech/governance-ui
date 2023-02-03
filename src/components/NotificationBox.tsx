import { Report } from '../lifecycle/types';
import { Card } from '../ui/nextui';

const TRANSIENT_DISPLAY_TIME_MS = 3000; //milliseconds

export function NotificationBox({
  reports,
  removeReport,
}: {
  reports?: Report[];
  removeReport: (index: number) => void;
}): JSX.Element {
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
        <div className="absolute bottom-4 right-4 z-50 max-w-[50%] text-xs">
          {!isTransient && (
            <div
              className="absolute right-px top-1  z-50 flex h-4 w-4 cursor-pointer justify-center"
              onClick={removeCurrent}
            >
              x
            </div>
          )}
          <Card className="pl-2 pr-2" variant="shadow">
            {current.message}
          </Card>
        </div>
      )}
    </>
  );
}
