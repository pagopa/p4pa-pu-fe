const mimeTypes: Record<string, string[]> = {
  jpg: ['image/jpeg'],
  png: ['image/png'],
  pdf: ['application/pdf'],
  zip: ['application/zip']
};

export const isExtensionAllowed = (
  file: File,
  fileExtensionsAllowed: string[]
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
