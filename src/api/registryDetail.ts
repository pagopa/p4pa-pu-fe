import { useQuery } from '@tanstack/react-query';
import { RequestParams } from '../../generated/apiClient';
import utils from '../utils';

export const usePagoPaRegistry = (
  organizationId: number,
  registryId: string,
  enabled = true,
  params?: RequestParams
) =>
  useQuery({
    queryKey: ['pagoPaRegistry', organizationId, registryId],
    queryFn: async () => {
      const response = await utils.apiClient.bff.getPagoPaRegistry(
        organizationId,
        registryId,
        params
      );
      return response.data;
    },
    enabled: enabled && !!organizationId && !!registryId
  });

export const useSilRegistry = (
  organizationId: number,
  registryId: string,
  enabled = true,
  params?: RequestParams
) =>
  useQuery({
    queryKey: ['silRegistry', organizationId, registryId],
    queryFn: async () => {
      const response = await utils.apiClient.bff.getSilRegistry(
        organizationId,
        registryId,
        params
      );
      return response.data;
    },
    enabled: enabled && !!organizationId && !!registryId
  });

export const useRegistry = (
  registryType: 'pagopa' | 'sil',
  organizationId: number,
  registryId: string,
  enabled = true,
  params?: RequestParams
) => {
  const pagoPaQuery = usePagoPaRegistry(
    organizationId,
    registryId,
    enabled && registryType === 'pagopa',
    params
  );

  const silQuery = useSilRegistry(
    organizationId,
    registryId,
    enabled && registryType === 'sil',
    params
  );

  return registryType === 'pagopa' ? pagoPaQuery : silQuery;
};
