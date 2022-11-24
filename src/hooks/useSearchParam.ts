// Copied from https://github.com/streamich/react-use, [Unlicensed](https://github.com/streamich/react-use/blob/master/LICENSE)

import { useEffect, useState } from 'react';

const getValue = (search: string, param: string) => new URLSearchParams(search).get(param);

export type UseQueryParam = (param: string) => string | null;

const useSearchParam: UseQueryParam = (param) => {
  const location = window.location;
  const [value, setValue] = useState<string | null>(() => getValue(location.search, param));

  useEffect(() => {
    const onChange = () => {
      setValue(getValue(location.search, param));
    };

    window.addEventListener('popstate', onChange);
    window.addEventListener('pushstate', onChange);
    window.addEventListener('replacestate', onChange);

    return () => {
      window.removeEventListener('popstate', onChange);
      window.removeEventListener('pushstate', onChange);
      window.removeEventListener('replacestate', onChange);
    };
  }, []);

  return value;
};

export default useSearchParam;