import { useMutation } from '@tanstack/react-query';
import { RequestParams } from '../../../generated/apiClient';
import utils from '../../utils';

export const useGenerateSupersetUrl = () =>
  useMutation({
    mutationKey: ['generateSupersetUrl'],
    mutationFn: async ({
      organizationId,
      params
    }: {
      organizationId: number;
      params?: RequestParams;
    }) => {
      const response = await utils.apiClient.bff.generateSupersetUrl(
        { organizationId },
        params
      );
      return response;
    }
  });
