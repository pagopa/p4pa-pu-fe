/**
 * Truncates a string to a maximum length and adds ellipsis if truncated.
 * @param text - The string to truncate
 * @param maxLength - Maximum length before truncation (default: 50)
 * @returns The truncated string with ellipsis, or the original string if shorter than maxLength
 */
export const truncateText = (text: string, maxLength = 50): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Truncates all string values in an object (useful for i18n params).
 * @param params - Object containing key-value pairs
 * @param maxLength - Maximum length for string values (default: 50)
 * @returns New object with truncated string values
 */
export const truncateParams = <T extends Record<string, unknown>>(
  params: T,
  maxLength = 50
): T => {
  if (!params) return params;

  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      typeof value === 'string' ? truncateText(value, maxLength) : value
    ])
  ) as T;
};

/**
 * Trims leading and trailing whitespace from string values in an object.
 * @param obj - Object containing key-value pairs
 * @returns New object with trimmed string values
 */
export const trimStringValues = <T extends Record<string, unknown>>(
  obj: T
): T =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      typeof value === 'string' ? value.trim() : value
    ])
  ) as T;
