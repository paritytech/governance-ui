import React from 'react';
import styled from 'styled-components';
const Wallet = ({ name, state, iconUrl, clickHandler }) => {
  const { isConnected } = state;
  return (
    <WalletStyle>
      <div className="wallet-box" onClick={() => clickHandler()}>
        <div className="wallet-icon">
          {iconUrl ? <img src={iconUrl} /> : null}
        </div>
        <div className="wallet-info">
          <div>{name}</div>
        </div>
        <div className="wallet-state">
          {isConnected ? 'connected' : 'not connected'}
        </div>
      </div>
    </WalletStyle>
  );
};

const WalletStyle = styled.div`
  .wallet-box {
    display: flex;
    flex-flow: row nowrap;
    border: 1px solid;
    border-radius: 10px;
    margin: 5px 0;
    .wallet-icon {
      margin: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .wallet-info {
      margin: 5px;
      flex-grow: 1;
    }
    .wallet-state {
      margin: 5px;
    }
  }
`;

export default Wallet;
