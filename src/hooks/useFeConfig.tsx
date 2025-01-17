import brokers from '../api/brokers';

export const useFeConfig = () => {
  const { data, isError } = brokers.getBrokersConfig();

  if (isError) {
    // TODO handle config error
    // throw new Error('Failed to fetch config');
  }

  return data;
};
