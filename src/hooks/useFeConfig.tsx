import { useEffect } from 'react';
import brokers from '../api/brokers';
import { setConfigFe } from '../store/ConfigFeStore';
import { useStore } from '../store/GlobalStore';
import { STATE } from '../store/types';

export const useFeConfig = () => {
  const {
    state: { configFe },
    setState
  } = useStore();

  const { data, isLoading, isError, isSuccess } = brokers.getBrokersConfig({
    enabled: !configFe
  });

  useEffect(() => {
    if (!configFe) {
      setState(STATE.APP_STATE, { loading: isLoading });

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
