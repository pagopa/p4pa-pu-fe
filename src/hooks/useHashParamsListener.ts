import { useState, useEffect } from 'react';
import utils from '../utils';

export function decodeHash<T>(id?: string): T {
  const rawHash = window.location.hash.startsWith('#')
    ? window.location.hash.substring(1)
    : window.location.hash;
  try {
    const decodedHash = utils.URI.decode(rawHash);
    if (!id) {
      return decodedHash as T;
    } else {
      return Object.fromEntries(
        Object.entries(decodedHash)
        .map(([key, value]) => [key.replace(id, ''), value]) 
      ) as T;
    }
  } catch {
    return {} as T; // Return empty object in case of parse errors
  }
};

/**
 * Hook that listens to window hash changes and returns the decoded hash parameters as an object.
 */
export const useHashParamsListener = <
  T extends Record<string, unknown> = Record<string, unknown>
>(id = '') => {
  const [hashParams, setHashParams] = useState<T>(decodeHash(id));

  useEffect(() => {
    const onHashChange = () => {
      setHashParams(decodeHash(id));
    };

    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('hashchangeCustom', onHashChange);

    onHashChange();

    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('hashchangeCustom', onHashChange);
    };
  }, [id]);

  return hashParams;
};
