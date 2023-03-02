import type { SigningAccount } from '../../../contexts/Account.js';
import Account from './Account.js';

interface IAccountListProps {
  accounts: Map<string, SigningAccount>;
  connectedAccount: SigningAccount | undefined;
  accountConnectHandler: (account: SigningAccount) => void;
}

export const AccountList = ({
  accounts,
  connectedAccount,
  accountConnectHandler,
}: IAccountListProps) => {
  return (
    <div className="my-2 flex flex-col gap-2">
      {[...accounts.entries()].map(([key, signingAccount]) => {
        const { account } = signingAccount;
        const isConnected =
          !!connectedAccount &&
          connectedAccount.account.address === account.address;
        return (
          <Account
            key={key}
            name={account.name || ''}
            address={account.address}
            state={{ isConnected }}
            clickHandler={() => accountConnectHandler(signingAccount)}
          />
        );
      })}
    </div>
  );
};
