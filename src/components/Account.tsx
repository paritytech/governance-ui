import React from 'react';
import Identicon from '@polkadot/react-identicon';
import { stringShorten } from '@polkadot/util';
import styles from './Account.module.css';

export interface AccountProps {
  name: string;
  address: string;
  clickHandler: () => void;
  state: { isConnected: boolean };
}

const Account = ({ name, address, clickHandler, state }: AccountProps) => {
  const { isConnected } = state;
  return (
    <div className={styles.box} onClick={() => clickHandler()}>
      <div className={styles.icon}>
        <Identicon value={address} theme="polkadot" size={32} />
      </div>
      <div className={styles.info}>
        <div>{stringShorten(name, 10)}</div>
        <div>{stringShorten(address, 10)}</div>
      </div>
      <div className={styles.state}>{isConnected ? 'connected' : ''}</div>
    </div>
  );
};

export default Account;
