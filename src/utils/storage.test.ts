import storage from './storage';

describe('storage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('storage.clear should clear sessionStorage and localStorage', () => {
    // Mock the sessionStorage and localStorage
    const storageSpy = vi.spyOn(Storage.prototype, 'clear');

    storage.clear();

    // Assert that the clear methods were called
    expect(storageSpy).toHaveBeenCalled();
  });
});
