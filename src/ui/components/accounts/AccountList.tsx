import type { SigningAccount } from '../../../types';
import { useMemo } from 'react';
import Account from './Account.js';
import { encodeAddress } from '@polkadot/keyring';

export const AccountList = ({
  accounts,
  connectedAccount,
  ss58Format,
  accountConnectHandler,
}: {
  accounts: Map<string, SigningAccount>;
  connectedAccount: SigningAccount | undefined;
  ss58Format: number | undefined;
  accountConnectHandler: (account: SigningAccount | undefined) => void;
}) => {
  const otherAccounts = useMemo(() => {
    return [...accounts.values()].filter(
      ({ account }) => account?.address !== connectedAccount?.account?.address
    );
  }, [accounts, connectedAccount]);

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="my-4 border-b pb-2">
        {connectedAccount?.account && (
          <Account
            name={connectedAccount.account.name || ''}
            address={encodeAddress(
              connectedAccount.account.address,
              ss58Format
            )}
            state={{ isConnected: true }}
            clickHandler={() => {
              // disconnect
              accountConnectHandler(undefined);
            }}
          />
        )}
      </div>
      <div className="my-2 flex flex-col gap-2 overflow-auto">
        {otherAccounts.map((signingAccount) => {
          const { account } = signingAccount;
          return (
            <Account
              key={account.address}
              name={account.name || ''}
              address={encodeAddress(account.address, ss58Format)}
              state={{ isConnected: false }}
              clickHandler={() => accountConnectHandler(signingAccount)}
            />
          );
        })}
      </div>
    </div>
  );
};
