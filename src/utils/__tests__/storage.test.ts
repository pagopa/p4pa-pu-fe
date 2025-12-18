import storage from '../storage';

describe('storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should clear sessionStorage and localStorage', () => {
    window.sessionStorage.setItem('sessionKey', 'sessionValue');
    window.localStorage.setItem('localKey', 'localValue');

    storage.clear();

    expect(window.sessionStorage.getItem('sessionKey')).toBeNull();
    expect(window.localStorage.getItem('localKey')).toBeNull();
  });

  it('should preserve keys starting with "userProfilePreference:"', () => {
    window.localStorage.setItem('userProfilePreference:user-123', 'DP');
    window.localStorage.setItem('userProfilePreference:user-456', 'TM');
    window.localStorage.setItem('otherKey', 'otherValue');

    storage.clear();

    expect(window.localStorage.getItem('userProfilePreference:user-123')).toBe(
      'DP'
    );
    expect(window.localStorage.getItem('userProfilePreference:user-456')).toBe(
      'TM'
    );
    expect(window.localStorage.getItem('otherKey')).toBeNull();
  });

  it('should always clear sessionStorage completely', () => {
    window.sessionStorage.setItem('userProfilePreference:user-123', 'DP');
    window.sessionStorage.setItem('otherSessionKey', 'value');

    storage.clear();

    expect(
      window.sessionStorage.getItem('userProfilePreference:user-123')
    ).toBeNull();
    expect(window.sessionStorage.getItem('otherSessionKey')).toBeNull();
  });

  it('should handle empty storage gracefully', () => {
    expect(() => storage.clear()).not.toThrow();
  });
});
