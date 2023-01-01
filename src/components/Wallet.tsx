import React from 'react';
import { WalletState } from '../contexts/Wallets';
import styles from './Wallet.module.css';

export interface IWalletProps {
  name: string;
  state: WalletState;
  iconUrl?: string;
  clickHandler: () => void;
}

const Wallet = ({ name, state, iconUrl, clickHandler }: IWalletProps) => {
  const isConnected = state === 'connected';
  return (
    <div className={styles.box} onClick={() => clickHandler()}>
      <div className={styles.icon}>
        {iconUrl ? <img src={iconUrl} /> : null}
      </div>
      <div className={styles.info}>
        <div>{name}</div>
      </div>
      <div className={styles.state}>
        {isConnected ? 'connected' : 'not connected'}
      </div>
    </div>
  );
};

export default Wallet;
