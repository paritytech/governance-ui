import React, { useContext, createContext, useState } from 'react';

const accountContext = createContext({});
export const useAccount = () => useContext(accountContext);

const AccountProvider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState({});
  return (
    <accountContext.Provider value={{ account, setAccount }}>
      {children}
    </accountContext.Provider>
  );
};

export default AccountProvider;
