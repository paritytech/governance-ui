import * as React from 'react';

interface IconProps {
  height?: number;
}

function setTheme(themeName: string) {
  localStorage.setItem('data-theme', themeName);
  document.documentElement.setAttribute('data-theme', themeName);
}

(function () {
  if (localStorage.getItem('data-theme') === 'dark') {
    setTheme('dark');
  } else {
    setTheme('light');
  }
  console.log(localStorage.getItem('data-theme'));
})();

function IconDark({ height }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={height || `24`}
      fill="var(--colors-foreground-contrast)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 28 29"
    >
      <path
        fillRule="evenodd"
        stroke="none"
        d="M17.284 2.194C10.573.44 3.71 4.458 1.956 11.17.202 17.881 4.22 24.744 10.932 26.499c6.29 1.643 12.71-1.782 14.938-7.742a1 1 0 00-1.584-1.113A7.189 7.189 0 1119.29 4.986a1 1 0 00.396-1.895 12.615 12.615 0 00-2.403-.896z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

function IconLight({ height }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={height || `24`}
      fill="var(--colors-foreground-contrast)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 28 28"
    >
      <path
        fillRule="evenodd"
        stroke="none"
        d="M15.485 2a1 1 0 10-2 0v3a1 1 0 102 0V2zM14 8c-3.314 0-6 2.688-6 6.002a6.001 6.001 0 1012 0A6.001 6.001 0 0014 8zm0 14a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-8-8a1 1 0 01-1 1H2a1 1 0 110-2h3a1 1 0 011 1zm20 1a1 1 0 100-2h-3a1 1 0 100 2h3zM8.343 19.657a1 1 0 010 1.414l-2.121 2.121a1 1 0 11-1.415-1.414l2.122-2.121a1 1 0 011.414 0zM23.678 6.222a1 1 0 00-1.415-1.414l-2.121 2.121a1 1 0 001.414 1.414l2.122-2.121zM8.828 8.343a1 1 0 01-1.414 0L5.293 6.222a1 1 0 011.414-1.414L8.83 6.929a1 1 0 010 1.414zm12.95 14.85a1 1 0 001.414-1.415l-2.12-2.121a1 1 0 00-1.415 1.414l2.121 2.121z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

export default function ThemeSwitch() {
  const [currentTheme, setCurrentTheme] = React.useState(
    localStorage.getItem('data-theme')
  );

  const toggleOn = () => {
    const theme = localStorage.getItem('data-theme');
    if (theme === 'dark') {
      setTheme('light');
      setCurrentTheme('light');
    } else {
      setTheme('dark');
      setCurrentTheme('dark');
    }
  };

  return (
    <div className="px-3 py-3" onClick={toggleOn}>
      {currentTheme === 'dark' ? (
        <IconDark height={20} />
      ) : (
        <IconLight height={20} />
      )}
    </div>
  );
}
