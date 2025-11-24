import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  saveUserProfilePreference,
  getUserProfilePreference,
  removeUserProfilePreference
} from '../userPreferences';
import { USER_PROFILES } from '../../routes/Home/models';

describe('userPreferences', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    function getItem(key: string) {
      return store[key] || null;
    }

    function setItem(key: string, value: string) {
      store[key] = value.toString();
    }

    function removeItem(key: string) {
      Reflect.deleteProperty(store, key);
    }

    function clear() {
      store = {};
    }

    return {
      getItem,
      setItem,
      removeItem,
      clear
    };
  })();

  function quotaExceededThrower(): never {
    throw new Error('QuotaExceededError');
  }

  function storageDisabledThrower(): never {
    throw new Error('Storage disabled');
  }

  function genericStorageErrorThrower(): never {
    throw new Error('Storage error');
  }

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    localStorageMock.clear();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  describe('saveUserProfilePreference', () => {
    const validUserId = 'user-123';
    const validPreference = USER_PROFILES.DP;

    it('saves a valid preference correctly', () => {
      const result = saveUserProfilePreference(validUserId, validPreference);

      expect(result).toBe(true);
      expect(localStorage.getItem(`userProfilePreference_${validUserId}`)).toBe(
        validPreference
      );
    });

    it('saves all valid preferences correctly', () => {
      const preferences = [
        USER_PROFILES.DP,
        USER_PROFILES.TM,
        USER_PROFILES.OM
      ];

      for (let index = 0; index < preferences.length; index += 1) {
        const pref = preferences[index];
        const userId = `user-${index}`;
        const result = saveUserProfilePreference(userId, pref);

        expect(result).toBe(true);
        expect(localStorage.getItem(`userProfilePreference_${userId}`)).toBe(
          pref
        );
      }
    });

    it('overwrites an existing preference', () => {
      saveUserProfilePreference(validUserId, USER_PROFILES.DP);
      expect(localStorage.getItem(`userProfilePreference_${validUserId}`)).toBe(
        USER_PROFILES.DP
      );

      const result = saveUserProfilePreference(validUserId, USER_PROFILES.TM);

      expect(result).toBe(true);
      expect(localStorage.getItem(`userProfilePreference_${validUserId}`)).toBe(
        USER_PROFILES.TM
      );
    });

    describe('input validation', () => {
      it('returns false if mappedExternalUserId is empty', () => {
        const result = saveUserProfilePreference('', validPreference);

        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalled();
        expect(localStorage.getItem('userProfilePreference_')).toBeNull();
      });

      it('returns false if mappedExternalUserId is null', () => {
        const result = saveUserProfilePreference(
          null as unknown as string,
          validPreference
        );

        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalled();
      });

      it('returns false if mappedExternalUserId is undefined', () => {
        const result = saveUserProfilePreference(
          undefined as unknown as string,
          validPreference
        );

        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalled();
      });

      it('returns false if mappedExternalUserId is not a string', () => {
        const result = saveUserProfilePreference(
          123 as unknown as string,
          validPreference
        );

        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalled();
      });

      it('returns false if preference is empty', () => {
        const result = saveUserProfilePreference(
          validUserId,
          '' as USER_PROFILES
        );

        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalled();
        expect(
          localStorage.getItem(`userProfilePreference_${validUserId}`)
        ).toBeNull();
      });

      it('returns false if preference is null', () => {
        const result = saveUserProfilePreference(
          validUserId,
          null as unknown as USER_PROFILES
        );

        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalled();
      });

      it('returns false if preference is undefined', () => {
        const result = saveUserProfilePreference(
          validUserId,
          undefined as unknown as USER_PROFILES
        );

        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalled();
      });

      it('returns false if preference is not a valid USER_PROFILES value', () => {
        const result = saveUserProfilePreference(
          validUserId,
          'invalidPreference' as USER_PROFILES
        );

        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalled();
        expect(
          localStorage.getItem(`userProfilePreference_${validUserId}`)
        ).toBeNull();
      });
    });

    describe('error handling', () => {
      it('handles errors correctly during save (quota exceeded)', () => {
        const setItemSpy = vi
          .spyOn(localStorage, 'setItem')
          .mockImplementation(quotaExceededThrower);

        const result = saveUserProfilePreference(validUserId, validPreference);

        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalled();

        setItemSpy.mockRestore();
      });

      it('handles generic errors correctly during save', () => {
        const setItemSpy = vi
          .spyOn(localStorage, 'setItem')
          .mockImplementation(storageDisabledThrower);

        const result = saveUserProfilePreference(validUserId, validPreference);

        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalled();

        setItemSpy.mockRestore();
      });
    });
  });

  describe('getUserProfilePreference', () => {
    const validUserId = 'user-123';

    it('retrieves a saved preference correctly', () => {
      const preference = USER_PROFILES.DP;
      localStorage.setItem(`userProfilePreference_${validUserId}`, preference);

      const result = getUserProfilePreference(validUserId);

      expect(result).toBe(preference);
    });

    it('retrieves all valid preferences correctly', () => {
      const preferences = [
        USER_PROFILES.DP,
        USER_PROFILES.TM,
        USER_PROFILES.OM
      ];

      for (let index = 0; index < preferences.length; index += 1) {
        const pref = preferences[index];
        const userId = `user-${index}`;
        localStorage.setItem(`userProfilePreference_${userId}`, pref);

        const result = getUserProfilePreference(userId);
        expect(result).toBe(pref);
      }
    });

    it('returns null if preference does not exist', () => {
      const result = getUserProfilePreference(validUserId);

      expect(result).toBeNull();
    });

    it('removes and returns null if saved value is invalid', () => {
      const invalidValue = 'invalidPreference';
      localStorage.setItem(
        `userProfilePreference_${validUserId}`,
        invalidValue
      );

      const result = getUserProfilePreference(validUserId);

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalled();
      expect(
        localStorage.getItem(`userProfilePreference_${validUserId}`)
      ).toBeNull();
    });

    describe('input validation', () => {
      it('returns null if mappedExternalUserId is empty', () => {
        const result = getUserProfilePreference('');

        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalled();
      });

      it('returns null if mappedExternalUserId is null', () => {
        const result = getUserProfilePreference(null as unknown as string);

        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalled();
      });

      it('returns null if mappedExternalUserId is undefined', () => {
        const result = getUserProfilePreference(undefined as unknown as string);

        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalled();
      });

      it('returns null if mappedExternalUserId is not a string', () => {
        const result = getUserProfilePreference(123 as unknown as string);

        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      it('handles errors correctly during retrieval', () => {
        const getItemSpy = vi
          .spyOn(localStorage, 'getItem')
          .mockImplementation(genericStorageErrorThrower);

        const result = getUserProfilePreference(validUserId);

        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalled();

        getItemSpy.mockRestore();
      });
    });
  });

  describe('removeUserProfilePreference', () => {
    const validUserId = 'user-123';
    const validPreference = USER_PROFILES.DP;

    it('removes an existing preference correctly', () => {
      localStorage.setItem(
        `userProfilePreference_${validUserId}`,
        validPreference
      );
      expect(localStorage.getItem(`userProfilePreference_${validUserId}`)).toBe(
        validPreference
      );

      const result = removeUserProfilePreference(validUserId);

      expect(result).toBe(true);
      expect(
        localStorage.getItem(`userProfilePreference_${validUserId}`)
      ).toBeNull();
    });

    it('returns true even if preference does not exist', () => {
      const result = removeUserProfilePreference(validUserId);

      expect(result).toBe(true);
      expect(
        localStorage.getItem(`userProfilePreference_${validUserId}`)
      ).toBeNull();
    });

    describe('input validation', () => {
      it('returns false if mappedExternalUserId is empty', () => {
        const result = removeUserProfilePreference('');

        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalled();
      });

      it('returns false if mappedExternalUserId is null', () => {
        const result = removeUserProfilePreference(null as unknown as string);

        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalled();
      });

      it('returns false if mappedExternalUserId is undefined', () => {
        const result = removeUserProfilePreference(
          undefined as unknown as string
        );

        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalled();
      });

      it('returns false if mappedExternalUserId is not a string', () => {
        const result = removeUserProfilePreference(123 as unknown as string);

        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      it('handles errors correctly during removal', () => {
        const removeItemSpy = vi
          .spyOn(localStorage, 'removeItem')
          .mockImplementation(genericStorageErrorThrower);

        const result = removeUserProfilePreference(validUserId);

        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalled();

        removeItemSpy.mockRestore();
      });
    });
  });

  describe('function integration', () => {
    const validUserId = 'user-integration-test';

    it('saves, retrieves and removes a preference correctly', () => {
      const preference = USER_PROFILES.OM;

      const saveResult = saveUserProfilePreference(validUserId, preference);
      expect(saveResult).toBe(true);

      const getResult = getUserProfilePreference(validUserId);
      expect(getResult).toBe(preference);

      const removeResult = removeUserProfilePreference(validUserId);
      expect(removeResult).toBe(true);

      const getAfterRemove = getUserProfilePreference(validUserId);
      expect(getAfterRemove).toBeNull();
    });

    it('handles multiple users with different preferences correctly', () => {
      const users = [
        { id: 'user-1', pref: USER_PROFILES.DP },
        { id: 'user-2', pref: USER_PROFILES.TM },
        { id: 'user-3', pref: USER_PROFILES.OM }
      ];

      for (const { id, pref } of users) {
        const result = saveUserProfilePreference(id, pref);
        expect(result).toBe(true);
      }

      for (const { id, pref } of users) {
        const result = getUserProfilePreference(id);
        expect(result).toBe(pref);
      }

      for (const { id } of users) {
        const result = removeUserProfilePreference(id);
        expect(result).toBe(true);
      }

      for (const { id } of users) {
        const result = getUserProfilePreference(id);
        expect(result).toBeNull();
      }
    });
  });
});
