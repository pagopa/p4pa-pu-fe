import { useEffect } from 'react';
import { useStore } from '../store/GlobalStore';
import utils from '../utils';
import { setOrganizationId } from '../store/OrganizationIdStore';

export const useOrganizations = () => {
  // const { data } = utils.loaders.getOrganizations();
  // return data;

  const {
    state: { organizationId },
  } = useStore();
  
  const { data, isLoading, isError, isSuccess, error } = utils.loaders.getOrganizations();
  
  useEffect(() => {
    if (!organizationId) {
      
      if (isSuccess && data) {
        setOrganizationId(data[0].organizationId);
      }
  
      if (isError) {
        // TODO: Handle error (e.g., show a toast)
        console.error('Failed to fetch fe config', error);
      }
    }
  }, [data, isLoading, isError, isSuccess]);
  
  return data;
};
