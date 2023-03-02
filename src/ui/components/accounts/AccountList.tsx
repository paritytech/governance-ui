import type { SigningAccount } from '../../../contexts/Account.js';
import { useMemo } from 'react';
import Account from './Account.js';

export const AccountList = ({
  accounts,
  connectedAccount,
  accountConnectHandler,
}: {
  accounts: Map<string, SigningAccount>;
  connectedAccount: SigningAccount | undefined;
  accountConnectHandler: (account: SigningAccount | undefined) => void;
}) => {
  const otherAccounts = useMemo(() => {
    return [...accounts.values()].filter(
      ({ account }) => account?.address !== connectedAccount?.account?.address
    );
  }, [accounts, connectedAccount]);
  return (
    <>
      <div className="my-4 border-b pb-2">
        {connectedAccount?.account && (
          <Account
            name={connectedAccount.account.name || ''}
            address={connectedAccount.account.address}
            state={{ isConnected: true }}
            clickHandler={() => {
              // disconnect
              accountConnectHandler(undefined);
            }}
          />
        )}
      </div>
      <div className="my-2 flex flex-col gap-2">
        {otherAccounts.map((signingAccount) => {
          const { account } = signingAccount;
          return (
            <Account
              key={account.address}
              name={account.name || ''}
              address={account.address}
              state={{ isConnected: false }}
              clickHandler={() => accountConnectHandler(signingAccount)}
            />
          );
        })}
      </div>
    </>
  );
};
