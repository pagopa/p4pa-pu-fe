import { useQuery } from '@tanstack/react-query';
import utils from '../utils';
import { parseAndLog } from '../utils/loaders';
import { classificationDetailDTOSchema } from '../../generated/zod-schema';

export const getClassificationDetail = (
  organizationId: number,
  classificationId: number
) => {
  return useQuery({
    queryKey: ['getClassificationDetail', organizationId, classificationId],
    queryFn: async () => {
      const { data: classificationDetail } =
        await utils.apiClient.bff.getClassificationDetail(
          organizationId,
          classificationId
        );
      if (classificationDetail) {
        parseAndLog(classificationDetailDTOSchema, classificationDetail);
      }
      return classificationDetail;
    }
  });
};
