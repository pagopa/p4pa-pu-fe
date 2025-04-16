import { useEffect } from 'react';
import brokers from '../api/brokers';
import { setConfigFe } from '../store/ConfigFeStore';
import { useStore } from '../store/GlobalStore';

export const useFeConfig = () => {
  const {
    state: { configFe }
  } = useStore();

  const { data, isError, isSuccess, error } = brokers.getBrokersConfig({
    enabled: !configFe
  });

  useEffect(() => {
    if (!configFe) {
      if (isSuccess && data) {
        setConfigFe(data);
      }

      if (isError) {
        // TODO: Handle error (e.g., show a toast)
        console.error('Failed to fetch fe config', error);
      }
    }
  }, [data, isError, isSuccess]);

  return configFe;
};
