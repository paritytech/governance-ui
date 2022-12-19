import React from 'react';
import Identicon from '@polkadot/react-identicon';
import { stringShorten } from '@polkadot/util';
import styled from 'styled-components';
export interface AccountProps {
  name: string;
  address: string;
  clickHandler: () => void;
  state: { isConnected: boolean };
}
const Account = ({ name, address, clickHandler, state }: AccountProps) => {
  const { isConnected } = state;
  return (
    <AccountStyle>
      <div className="account-box" onClick={() => clickHandler()}>
        <div className="account-icon">
          <Identicon value={address} theme="polkadot" size={32} />
        </div>
        <div className="account-info">
          <div>{stringShorten(name, 10)}</div>
          <div>{stringShorten(address, 10)}</div>
        </div>
        <div className="account-state">{isConnected ? 'connected' : ''}</div>
      </div>
    </AccountStyle>
  );
};

const AccountStyle = styled.div`
  .account-box {
    display: flex;
    flex-flow: row nowrap;
    border: 1px solid;
    border-radius: 10px;
    margin: 5px 0;
    .account-icon {
      margin: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .account-info {
      margin: 5px;
      display: flex;
      flex-grow: 1;
      flex-flow: column wrap;
    }
    .account-state {
      margin: 5px;
    }
  }
`;

export default Account;
