import React from 'react';
import ConnectButton from './connect';
import styles from '../../assets/css/header.module.css';

const Header = () => (
  <div className={styles.box}>
    <div />
    <div className={styles.nav}></div>
    <div>
      <ConnectButton color="secondary" bordered />
    </div>
  </div>
);

export default Header;
