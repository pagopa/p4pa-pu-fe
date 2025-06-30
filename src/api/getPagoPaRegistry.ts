import { useMutation } from '@tanstack/react-query';
import utils from '../utils';

const getPagoPaRegistries = (
  organizationId: Parameters<
    typeof utils.apiClient.bff.getPagoPaRegistries
  >['0']
) =>
  useMutation({
    mutationKey: ['getPagoPaRegistry', organizationId],
    mutationFn: async (
      query: Parameters<typeof utils.apiClient.bff.getPagoPaRegistries>['1']
    ) => {
      const { data: response } = await utils.apiClient.bff.getPagoPaRegistries(
        organizationId,
        query
      );

      return response;
    }
  });

export default getPagoPaRegistries;
