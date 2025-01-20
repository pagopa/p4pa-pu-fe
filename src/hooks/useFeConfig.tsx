import { useEffect } from 'react';
import brokers from '../api/brokers';
import { setLoading } from '../store/AppStateStore';
import { setConfigFe } from '../store/ConfigFeStore';
import { useStore } from '../store/GlobalStore';

export const useFeConfig = () => {
  const {
    state: { configFe }
  } = useStore();

  const { data, isLoading, isError, isSuccess } = brokers.getBrokersConfig({
    enabled: !configFe
  });

  useEffect(() => {
    if (!configFe) {
      setLoading(isLoading);

      if (isSuccess && data) {
        setConfigFe(data);
      }

      if (isError) {
        // TODO: Handle error (e.g., show a toast)
        console.error('Failed to fetch fe config');
      }
    }
  }, [data, isLoading, isError, isSuccess]);

  return configFe;
};
