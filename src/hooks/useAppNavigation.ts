import { NavigateOptions, To, useNavigate } from 'react-router';
import utils from '../utils';

/**
 * Use this just like useNavigate, but with an optional extra `hashObject` param.
 * If you pass a hashObject, it gets encoded and appended to the path as a hash.
 */
export function useAppNavigate() {
  const navigate = useNavigate();

  const appNavigate = (
    to: To,
    options?: NavigateOptions & { hashObject?: Record<string, unknown> }
  ) => {
    let path = to;
    if (options?.hashObject !== undefined) {
      const hash = utils.URI.encode(options.hashObject);
      path = hash ? `${to}#${hash}` : to;
      delete options.hashObject;
    }

    const filteredOptions = Object.fromEntries(
      Object.entries(options || {}).filter(([, v]) => v !== undefined)
    );

    return Object.keys(filteredOptions).length > 0
      ? navigate(path, options)
      : navigate(path);
  };

  return appNavigate;
}
