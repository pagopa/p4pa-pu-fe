export const toUTCString = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString();
};
