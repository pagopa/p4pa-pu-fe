export const getDefaultDateRange = () => {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  return {
    from: new Date(oneYearAgo.setHours(0, 0, 0, 0)).toISOString(),
    to: new Date(today.setHours(23, 59, 59, 999)).toISOString()
  };
};
