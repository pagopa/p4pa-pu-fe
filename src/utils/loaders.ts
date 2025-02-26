import { useQuery } from '@tanstack/react-query';
import { ZodSchema } from 'zod';
import * as zodSchema from '../../generated/zod-schema';
import utils from '.';
import { setOrganizationId } from '../store/OrganizationIdStore';
import { setOperatorRole } from '../store/OperatorRoleStore';

export const parseAndLog = <T>(
  schema: ZodSchema,
  data: T,
  throwError: boolean = true
): void | never => {
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
      const { data: organizations } = await utils.apiClient.bff.getOrganizations();
      if (organizations) {
        parseAndLog(zodSchema.organizationDTOSchema, organizations[0]);
        const firstOrganization = organizations[0];
        setOrganizationId(firstOrganization.organizationId);
        setOperatorRole(firstOrganization.operatorRole);
      }
      return organizations;
    }
  });
};

export default {
  getOrganizations
};

