/**
 * Utility to manage user preferences in localStorage
 *
 * This utility manages the saving and retrieval of user preferences
 * associated with the user's mappedExternalUserId.
 * Preferences are saved in localStorage with a unique key
 * based on the user's mappedExternalUserId.
 */

import { USER_PROFILES } from '../routes/Home/models';

/**
 * Type for the user profile preference
 * Rappresenta uno dei valori validi dell'enum USER_PROFILES
 */
export type UserProfilePreference = USER_PROFILES;

/**
 * Base key used to build the localStorage key
 * Final format: `userProfilePreference_${mappedExternalUserId}`
 */
const STORAGE_KEY_PREFIX = 'userProfilePreference_';

/**
 * Builds the localStorage key for a specific user
 *
 * @param mappedExternalUserId - The external mapped userId
 * @returns The complete key for the localStorage
 */
const buildStorageKey = (mappedExternalUserId: string): string => {
  return `${STORAGE_KEY_PREFIX}${mappedExternalUserId}`;
};

/**
 * Saves the user profile preference in localStorage
 *
 * The preference is saved associated with the user's mappedExternalUserId.
 * In case of error during saving, the error is logged
 * but no exception is thrown to not interrupt the application flow.
 *
 * @param mappedExternalUserId - The external mapped userId (required)
 * @param preference - The user profile preference selected by the user
 * @returns true if the saving was completed successfully, false otherwise
 *
 * @example
 * ```typescript
 * saveUserProfilePreference('user-123', USER_PROFILES.DP);
 * ```
 */
export const saveUserProfilePreference = (
  mappedExternalUserId: string,
  preference: UserProfilePreference
): boolean => {
  if (!mappedExternalUserId || typeof mappedExternalUserId !== 'string') {
    console.error(
      'saveUserProfilePreference: mappedExternalUserId must be a non-empty string'
    );
    return false;
  }

  if (!preference || !Object.values(USER_PROFILES).includes(preference)) {
    console.error(
      'saveUserProfilePreference: preference must be a valid value of USER_PROFILES'
    );
    return false;
  }

  try {
    const storageKey = buildStorageKey(mappedExternalUserId);
    localStorage.setItem(storageKey, preference);
    return true;
  } catch (error) {
    // Common error handling (quota exceeded, storage disabled, etc.)
    console.error(
      'Error during saving the user profile preference in localStorage:',
      error
    );
    return false;
  }
};

/**
 * Retrieves the user profile preference from localStorage
 *
 * @param mappedExternalUserId - The external mapped userId
 * @returns The saved preference or null if not present or in case of error
 *
 * @example
 * ```typescript
 * const preference = getUserProfilePreference('user-123');
 * if (preference) {
 *   console.log('Preference found:', preference);
 * }
 * ```
 */
export const getUserProfilePreference = (
  mappedExternalUserId: string
): UserProfilePreference | null => {
  if (!mappedExternalUserId || typeof mappedExternalUserId !== 'string') {
    console.error(
      'getUserProfilePreference: mappedExternalUserId must be a non-empty string'
    );
    return null;
  }

  try {
    const storageKey = buildStorageKey(mappedExternalUserId);
    const storedValue = localStorage.getItem(storageKey);

    if (!storedValue) {
      return null;
    }

    // Validation that the retrieved value is a valid value of USER_PROFILES
    if (
      Object.values(USER_PROFILES).includes(
        storedValue as UserProfilePreference
      )
    ) {
      return storedValue as UserProfilePreference;
    }

    // If the value is not valid, log a warning and remove the corrupted value
    console.warn(
      `Invalid value found in localStorage for the key ${storageKey}: ${storedValue}. The value will be removed.`
    );
    localStorage.removeItem(storageKey);
    return null;
  } catch (error) {
    console.error(
      'Error during retrieval of the user profile preference from localStorage:',
      error
    );
    return null;
  }
};

/**
 * Removes the user profile preference from localStorage
 *
 * @param mappedExternalUserId - The external mapped userId
 * @returns true if the removal was completed successfully, false otherwise
 *
 * @example
 * ```typescript
 * removeUserProfilePreference('user-123');
 * ```
 */
export const removeUserProfilePreference = (
  mappedExternalUserId: string
): boolean => {
  if (!mappedExternalUserId || typeof mappedExternalUserId !== 'string') {
    console.error(
      'removeUserProfilePreference: mappedExternalUserId must be a non-empty string'
    );
    return false;
  }

  try {
    const storageKey = buildStorageKey(mappedExternalUserId);
    localStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error(
      'Error during removal of the user profile preference from localStorage:',
      error
    );
    return false;
  }
};

export default {
  saveUserProfilePreference,
  getUserProfilePreference,
  removeUserProfilePreference
};
