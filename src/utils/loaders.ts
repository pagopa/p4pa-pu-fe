import { useQuery } from '@tanstack/react-query';
import { ZodSchema } from 'zod';
import * as zodSchema from '../../generated/zod-schema';
import utils from '.';

const parseAndLog = <T>(schema: ZodSchema, data: T, throwError: boolean = true): void | never => {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(result.error.issues);
    if (throwError) throw result.error;
  }
};
  
const getOrganizations = () => {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data: organizations } = await utils.apiClient.organizations.getOrganizations();
      if (organizations) {
        parseAndLog(zodSchema.organizationDTOSchema, organizations[0]);
      }
      return organizations;
    }
  });
};

export default {
  getOrganizations
};