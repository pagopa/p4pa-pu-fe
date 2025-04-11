import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadBlob } from './download';

describe('downloadBlob', () => {
  const originalCreateElement = document.createElement;
  const originalAppendChild = document.body.appendChild;
  const originalRemoveChild = document.body.removeChild;

  const mockAnchorElement = {
    href: '',
    download: '',
    click: vi.fn()
  } as unknown as HTMLAnchorElement;

  beforeEach(() => {
    document.createElement = vi.fn((tagName: string): HTMLElement => {
      if (tagName === 'a') {
        return mockAnchorElement;
      }
      throw new Error(`Creazione non prevista per il tag: ${tagName}`);
    }) as typeof document.createElement;

    document.body.appendChild = vi.fn() as typeof document.body.appendChild;
    document.body.removeChild = vi.fn() as typeof document.body.removeChild;

    window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    window.URL.revokeObjectURL = vi.fn();

    vi.clearAllMocks();
  });

  afterEach(() => {
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;
  });

  it('should create an anchor element with correct properties', () => {
    const blob = new Blob(['test content'], { type: 'text/plain' });
    const fileName = 'test-file.txt';

    downloadBlob(blob, fileName);

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockAnchorElement.href).toBe('blob:mock-url');
    expect(mockAnchorElement.download).toBe(fileName);
  });

  it('should append the anchor to the document body, click it, and then remove it', () => {
    const blob = new Blob(['test content'], { type: 'text/plain' });
    const fileName = 'test-file.txt';

    downloadBlob(blob, fileName);

    expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchorElement);
    expect(mockAnchorElement.click).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalledWith(mockAnchorElement);
  });

  it('should create and revoke object URL', () => {
    const blob = new Blob(['test content'], { type: 'text/plain' });
    const fileName = 'test-file.txt';

    downloadBlob(blob, fileName);

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should handle files with different types', () => {
    const pdfBlob = new Blob(['pdf content'], { type: 'application/pdf' });
    const csvBlob = new Blob(['csv,content'], { type: 'text/csv' });

    downloadBlob(pdfBlob, 'document.pdf');
    expect(URL.createObjectURL).toHaveBeenCalledWith(pdfBlob);
    expect(mockAnchorElement.download).toBe('document.pdf');

    vi.clearAllMocks();

    downloadBlob(csvBlob, 'data.csv');
    expect(URL.createObjectURL).toHaveBeenCalledWith(csvBlob);
    expect(mockAnchorElement.download).toBe('data.csv');
  });

  it('should work with long file names', () => {
    const blob = new Blob(['test content'], { type: 'text/plain' });
    const longFileName =
      'very-long-file-name-with-many-characters-test-test-test-test-1234567890.txt';

    downloadBlob(blob, longFileName);

    expect(mockAnchorElement.download).toBe(longFileName);
  });
});
