import React from 'react';
import ConnectButton from './connect';
import styled from 'styled-components';
const HeaderStyle = styled.div`
  padding: 10px;
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  .nav-bar {
    flex-grow: 1;
  }
`;

const Header = () => (
  <HeaderStyle>
    <div className="brand" />
    <div className="nav-bar"></div>
    <div className="account-connect">
      <ConnectButton color="secondary" bordered />
    </div>
  </HeaderStyle>
);

export default Header;
