import { useMemo } from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import { OrgSilServiceExtendedDTO } from '../../../../generated/core/data-contracts';

type ServiceSelectorOption = {
  value: number;
  label: string;
  description?: string;
};

type ServiceSelectorState = {
  options: Array<ServiceSelectorOption>;
  isLoading: boolean;
  hasError: boolean;
  noOptionsAvailable: boolean;
};

const hasValidId = (
  service: OrgSilServiceExtendedDTO
): service is OrgSilServiceExtendedDTO & { orgSilServiceId: number } => {
  return (
    typeof service.orgSilServiceId === 'number' && service.orgSilServiceId > 0
  );
};

export const useServiceSelectorState = (
  query: UseQueryResult<Array<OrgSilServiceExtendedDTO>, Error>
): ServiceSelectorState => {
  const { data: services, isLoading, error } = query;

  const options = useMemo(() => {
    if (!services || services.length === 0) return [];

    return services.filter(hasValidId).map((service) => ({
      value: service.orgSilServiceId,
      label: service.applicationName,
      description: service.serviceUrl
    }));
  }, [services]);

  const noOptionsAvailable = !isLoading && options.length === 0;
  const hasError = !!error;

  return {
    options,
    isLoading,
    hasError,
    noOptionsAvailable
  };
};
