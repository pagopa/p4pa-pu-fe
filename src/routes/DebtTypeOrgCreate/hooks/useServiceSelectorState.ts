import { useMemo } from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import { OrgSilServiceDTO } from '../../../api/orgSilServices';

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
  placeholderKey: string;
  helperTextKey: string;
};

const hasValidId = (
  service: OrgSilServiceDTO
): service is OrgSilServiceDTO & { orgSilServiceId: number } => {
  return (
    typeof service.orgSilServiceId === 'number' && service.orgSilServiceId > 0
  );
};

export const useServiceSelectorState = (
  query: UseQueryResult<Array<OrgSilServiceDTO>, Error>,
  edit = false,
  baseTranslationKey: string
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

  const placeholderKey = useMemo(() => {
    if (isLoading) return 'commons.loading';
    if (noOptionsAvailable) return `${baseTranslationKey}.noOptions`;
    return `${baseTranslationKey}.placeholder`;
  }, [isLoading, noOptionsAvailable, baseTranslationKey]);

  const helperTextKey = useMemo(() => {
    if (hasError) return `${baseTranslationKey}.error`;
    if (edit) return `${baseTranslationKey}.editHelperText`;
    if (noOptionsAvailable) return `${baseTranslationKey}.noOptionsHelp`;
    return `${baseTranslationKey}.helperText`;
  }, [hasError, edit, noOptionsAvailable, baseTranslationKey]);

  return {
    options,
    isLoading,
    hasError,
    noOptionsAvailable,
    placeholderKey,
    helperTextKey
  };
};
