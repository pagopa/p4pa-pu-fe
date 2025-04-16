import { useQuery } from '@tanstack/react-query';
import { ZodSchema } from 'zod';
import * as zodSchema from '../../generated/zod-schema';
import utils from '.';

export function parseAndLog<T>(
  schema: ZodSchema,
  data: T,
  throwError = true
): void | never {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(result.error.issues);
    if (throwError) throw result.error;
  }
}

const getOrganizations = () => {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      try {
        const { data: organizations } =
          await utils.apiClient.bff.getOrganizations();
        if (organizations) {
          parseAndLog(zodSchema.organizationDTOSchema, organizations[0]);
        }
        return organizations;
      } catch (error) {
        console.error('Failed to fetch organizations:', error);

        // Reindirizza alla pagina di errore senza importare PageRoutes
        if (typeof window !== 'undefined' && window.location) {
          const deployPath = utils.config.deployPath || '';
          window.location.replace(`${deployPath}/error`);
        }

        return null;
      }
    },
    retry: false
  });
};

export default {
  getOrganizations
};
