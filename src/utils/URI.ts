import { unflatten, flatten } from 'flat';
import { formatDate, parse } from 'date-fns';

function decode(fragment: string): Record<string, string> {
  const params = new URLSearchParams(fragment);
  const flatObj: Record<string, string | Date> = {};
  const isDate = /^(\d{2})-(\d{2})-(\d{4})$/;

  params.forEach((value, key) => {
    const decodedKey = decodeURIComponent(key).replace('#', '');
    const decodedValue = decodeURIComponent(value);

    if (isDate.test(decodedValue)) {
      const parsedDate = parse(decodedValue, 'dd-MM-yyyy', new Date());
      flatObj[decodedKey] = parsedDate;
    } else {
      flatObj[decodedKey] = decodedValue;
    }
  });

  return unflatten(flatObj);
}

// Skips null, undefined, and empty strings; converts Dates to ISO strings
export function encode<T extends Record<string, unknown>>(obj: T): string {
  // Flatten the object to dot-notation keys
  const flattened = flatten(obj) as Record<string, unknown>;
  return Object.entries(flattened)
    .filter(([, value]) => !!value)
    .map(([key, value]) => {
      const strValue =
        value instanceof Date ? formatDate(value, 'dd-MM-yyyy') : String(value);
      return `${encodeURIComponent(key)}=${encodeURIComponent(strValue)}`;
    })
    .join('&');
}

/**
 * Set or update the window's URL fragment parameters without reload.
 */
const set = (params: string) => {
  window.history.pushState({}, '', `#${params}`);
};

export default {
  decode,
  encode,
  set
};
