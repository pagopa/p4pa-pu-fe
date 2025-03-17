import { describe, it, expect } from 'vitest';
import { copyToClipboard } from './clipboard';

describe('clipboard', () => {
  const mockWrite = vi.fn();
  beforeAll(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWrite
      },
      writable: true
    });
  });

  it('should be defined', () => {
    expect(copyToClipboard).toBeDefined();
  });

  it('should call callback on copy', async () => {
    const text = 'Hello, world!';
    const onCopied = vi.fn();
    await copyToClipboard(text, onCopied);
    expect(onCopied).toHaveBeenCalledWith(true);
    expect(mockWrite).toHaveBeenCalledWith(text);
  });
});
