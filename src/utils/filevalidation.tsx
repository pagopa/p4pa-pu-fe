const mimeTypes: Record<string, Array<string>> = {
  jpg: ['image/jpeg'],
  png: ['image/png'],
  pdf: ['application/pdf'],
  zip: ['application/zip', 'application/x-zip-compressed']
};

export const isExtensionAllowed = (
  file: File,
  fileExtensionsAllowed: Array<string>
): boolean => {
  const isMimeValid = Object.values(mimeTypes).some((types) =>
    types.includes(file.type)
  );
  if (!isMimeValid) {
    return false;
  }

  const fileExtension = file.name.split('.').pop();
  return fileExtensionsAllowed.includes(fileExtension || '');
};

/**
 * Converts a base64 data URL string to a File object
 * @param base64String - Base64 data URL (e.g., "data:image/png;base64,...")
 * @param fileName - Optional custom file name. If not provided, generates one based on MIME type
 * @returns File object or null if conversion fails
 */
export const base64ToFile = (
  base64String: string,
  fileName?: string
): File | null => {
  try {
    // Validate that it's a proper data URL
    if (!base64String.startsWith('data:')) {
      return null;
    }

    // Extract MIME type and base64 data
    const [header, base64Data] = base64String.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';

    // Generate file name if not provided
    if (!fileName) {
      const extension = mimeType.split('/')[1] || 'png';
      fileName = `logo.${extension}`;
    }

    // Convert base64 to binary
    const byteString = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    // Create File object
    const blob = new Blob([arrayBuffer], { type: mimeType });
    return new File([blob], fileName, { type: mimeType });
  } catch (error) {
    console.warn('Error converting base64 to File:', error);
    return null;
  }
};
