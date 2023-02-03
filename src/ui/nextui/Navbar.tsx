import { useState, createContext, useContext, forwardRef } from 'react';

const Brand = ({ children, className }) => {
  return (
    <div className={`flex items-center ${className || ''}`}> {children}</div>
  );
};

interface INavbarContext {
  collapsed: boolean;
  toggle: () => void;
}
const navbarContext = createContext<INavbarContext>({
  collapsed: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggle: () => {},
});
const useNavbar = () => useContext(navbarContext);
const NavbarContextProvider = ({ children }) => {
  const [collapsed, setCollapsed] = useState(true);
  const toggle = () => {
    setCollapsed((collapsed) => !collapsed);
  };
  return (
    <navbarContext.Provider value={{ collapsed, toggle }}>
      {children}
    </navbarContext.Provider>
  );
};

const Item = ({ children, className, onClick }) => {
  return (
    <li
      onClick={onClick}
      className={`block rounded py-2 pl-3 pr-4 text-gray-700 hover:bg-gray-100  md:p-0 md:hover:bg-transparent md:hover:text-blue-700 ${
        className || ''
      }`}
    >
      {children}
    </li>
  );
};

const Toggle = () => {
  const { toggle } = useNavbar();
  return (
    <div className={`flex md:hidden`}>
      <div
        onClick={() => toggle()}
        data-collapse-toggle="navbar-content"
        className="inline-flex items-center rounded-lg p-2 text-sm text-gray-500 "
        aria-controls="navbar-cta"
        aria-expanded="false"
      >
        <span className="sr-only">Open main menu</span>
        <svg
          className="h-6 w-6"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          ></path>
        </svg>
      </div>
    </div>
  );
};

const Content = ({ children, className, collapsable }) => {
  const { collapsed } = useNavbar();
  return (
    <div
      className={`${
        collapsed ? 'hidden' : 'flex'
      } absolute top-full left-0 z-20 order-last h-full min-h-screen w-full basis-full flex-col items-center justify-between overflow-y-auto overflow-x-hidden bg-white md:static md:order-none md:flex md:h-auto md:min-h-min md:w-auto md:basis-auto md:flex-row`}
      id="navbar-content"
    >
      <ul
        className={`mt-4 flex flex-col md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-white md:text-sm md:font-medium ${className}`}
      >
        {children}
      </ul>
    </div>
  );
};

const Navbar = forwardRef<HTMLElement>(({ className, children }, ref) => {
  return (
    <nav
      className={`relative rounded border-gray-200  bg-white px-2 py-2.5 sm:px-4 ${className}`}
      ref={ref}
    >
      <div className="mx-auto flex flex-wrap items-center justify-between md:container">
        <NavbarContextProvider>
          {children}
          <Toggle />
        </NavbarContextProvider>
      </div>
    </nav>
  );
});

export default Object.assign(Navbar, { Item, Brand, Content });
