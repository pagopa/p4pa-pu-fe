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
