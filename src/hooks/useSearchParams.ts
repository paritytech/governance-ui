// Inspired by https://github.com/streamich/react-use, [Unlicensed](https://github.com/streamich/react-use/blob/master/LICENSE)

import { useEffect, useState } from 'react';

export function extractParams(
  search: string,
  params: string[]
): Record<string, string> {
  const searchParams = new URLSearchParams(search);
  const entries = Array.from(searchParams.entries()).filter(([key, value]) => {
    if (params.includes(key)) {
      return [key, value];
    }
  });
  return Object.fromEntries(entries);
}

export function addQueryParamsChangeListener(
  onChange: EventListenerOrEventListenerObject
) {
  window.addEventListener('popstate', onChange);
  window.addEventListener('pushstate', onChange);
  window.addEventListener('replacestate', onChange);
}

export function removeQueryParamsChangeListener(
  onChange: EventListenerOrEventListenerObject
) {
  window.removeEventListener('popstate', onChange);
  window.removeEventListener('pushstate', onChange);
  window.removeEventListener('replacestate', onChange);
}

export function useSearchParams(params: string[]): Record<string, string> {
  const location = window.location;
  const [values, setValues] = useState(() =>
    extractParams(location.search, params)
  );

  useEffect(() => {
    const onChange = () => {
      setValues(extractParams(location.search, params));
    };

    addQueryParamsChangeListener(onChange);

    return () => {
      removeQueryParamsChangeListener(onChange);
    };
  }, []);

  return values;
}
