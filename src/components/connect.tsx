import { useWallets } from '../contexts/Wallets';

const Connect = () => {
  const { wallets } = useWallets();
  return (
    <div>
      {wallets?.map((wallet) => (
        // ToDo: add an account connect modal
        <div>{`${wallet?.metadata?.title}`}</div>
      ))}
    </div>
  );
};

export default Connect;
