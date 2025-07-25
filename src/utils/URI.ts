import { unflatten, flatten } from 'flat';
import { formatDate, parse } from 'date-fns';

function sanitizeKeyChars(input: string): string {
  // Allows letters, digits and literal dot
  return input.replace(/[^a-zA-Z0-9.]/g, '');
}

function decode(fragment: string): Record<string, string> {
  const params = new URLSearchParams(fragment);
  const flatObj: Record<string, string | Date> = {};
  const isDate = /^(\d{2})-(\d{2})-(\d{4})$/;

  params.forEach((value, key) => {
    const decodedKey = decodeURIComponent(key).replace('#', '');
    const sanitizedKey = sanitizeKeyChars(decodedKey);
    const decodedValue = decodeURIComponent(value);

    if (isDate.test(decodedValue)) {
      const parsedDate = parse(decodedValue, 'dd-MM-yyyy', new Date());
      flatObj[sanitizedKey] = parsedDate;
    } else {
      flatObj[sanitizedKey] = decodedValue;
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
