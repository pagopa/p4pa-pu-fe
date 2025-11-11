/**
 * Utilities to manage field-specific error keys in filters/forms.
 * Error keys convention: `${fieldId}_error`
 */

export type GenericValues = Readonly<Record<string, unknown>>;

/**
 * Returns a new object with the error message set for the given field id.
 */
export function setFieldError<T extends GenericValues>(
  values: T,
  fieldId: string,
  message: string
): T & Record<string, unknown> {
  const errorKey = `${fieldId}_error`;
  return {
    ...values,
    [errorKey]: message
  };
}

/**
 * Returns a new object with the error for the given field id cleared (set to empty string).
 * If the error key is not present, the original object is returned unchanged.
 */
export function clearFieldError<T extends GenericValues>(
  values: T,
  fieldId: string
): T & Record<string, unknown> {
  const errorKey = `${fieldId}_error`;
  if (!(errorKey in values)) {
    return values as T & Record<string, unknown>;
  }
  return {
    ...values,
    [errorKey]: ''
  };
}

/**
 * Returns a shallow-copied object without any keys that end with `_error`.
 * Useful before serializing filters into URL or sending to APIs.
 */
export function stripErrorFields<T extends GenericValues>(
  values: T
): Record<string, unknown> {
  const entries = Object.entries(values).filter(
    ([key]) => !key.endsWith('_error')
  );
  return Object.fromEntries(entries);
}
