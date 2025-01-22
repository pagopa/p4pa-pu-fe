import { describe, it, expect } from 'vitest';
import { isExtensionAllowed } from '../filevalidation';

describe('isExtensionAllowed', () => {
  const validFileTypes = {
    jpg: {
      extension: 'jpg',
      mimeType: 'image/jpeg',
    },
    png: {
      extension: 'png',
      mimeType: 'image/png',
    },
    pdf: {
      extension: 'pdf',
      mimeType: 'application/pdf',
    },
    zip: {
      extension: 'zip',
      mimeType: 'application/zip',
    },
  } as const;

  describe('Valid Cases', () => {
    Object.entries(validFileTypes).forEach(([type, { extension, mimeType }]) => {
      it(`validates ${type} files correctly`, () => {
        const file = new File([''], `test.${extension}`, { type: mimeType });
        expect(isExtensionAllowed(file, [extension])).toBe(true);
      });
    });

    it('validates files when multiple extensions are allowed', () => {
      const { pdf } = validFileTypes;
      const file = new File([''], `test.${pdf.extension}`, { type: pdf.mimeType });
      const allowedExtensions = Object.values(validFileTypes).map(t => t.extension);
      expect(isExtensionAllowed(file, allowedExtensions)).toBe(true);
    });
  });

  describe('Invalid Cases', () => {
    it('rejects files with invalid mime type', () => {
      const file = new File([''], 'test.jpg', { type: 'invalid/mimetype' });
      expect(isExtensionAllowed(file, ['jpg'])).toBe(false);
    });

    it('rejects files with extension not in allowed list', () => {
      const { jpg } = validFileTypes;
      const file = new File([''], `test.${jpg.extension}`, { type: jpg.mimeType });
      expect(isExtensionAllowed(file, ['pdf', 'zip'])).toBe(false);
    });

    it('rejects files without extension', () => {
      const { pdf } = validFileTypes;
      const file = new File([''], 'testfile', { type: pdf.mimeType });
      expect(isExtensionAllowed(file, [pdf.extension])).toBe(false);
    });

    it('handles empty extension array', () => {
      const { pdf } = validFileTypes;
      const file = new File([''], `test.${pdf.extension}`, { type: pdf.mimeType });
      expect(isExtensionAllowed(file, [])).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('handles files with multiple dots in name', () => {
      const { pdf } = validFileTypes;
      const file = new File([''], `my.test.file.${pdf.extension}`, { type: pdf.mimeType });
      expect(isExtensionAllowed(file, [pdf.extension])).toBe(true);
    });

    it('handles files with uppercase mime types', () => {
      const { pdf } = validFileTypes;
      const file = new File([''], `test.${pdf.extension}`, { type: pdf.mimeType.toUpperCase() });
      expect(isExtensionAllowed(file, [pdf.extension])).toBe(true);
    });

    it('handles files with spaces in name', () => {
      const { pdf } = validFileTypes;
      const file = new File([''], `my test file.${pdf.extension}`, { type: pdf.mimeType });
      expect(isExtensionAllowed(file, [pdf.extension])).toBe(true);
    });

  });
});
