import { useQuery } from '@tanstack/react-query';
import { ZodSchema } from 'zod';
import * as zodSchema from '../../generated/core/zod-schema';
import utils from '.';
import { getResourceUrl, ResourceType } from './resources';

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

const getOrganizationsPlain = async () => {
  const { data: organizations } = await utils.apiClient.bff.getOrganizations();
  if (organizations) {
    parseAndLog(zodSchema.organizationDTOSchema, organizations[0]);
  }
  return organizations;
};

const getOrganizations = () => {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: getOrganizationsPlain,
    retry: false
  });
};

/**
 * Fetches legal resource content (ToS or PP) from a static URL.
 * The URL is resolved via getResourceUrl by interpolating broker externalId, language and type.
 *
 * @param type - The resource type: 'tos' or 'pp'
 * @param lang - The language code (defaults to 'it')
 * @param brokerExternalId - The broker external identifier
 */
const useResourceContent = (
  type: ResourceType,
  lang = 'it',
  brokerExternalId = ''
) =>
  useQuery({
    queryKey: ['resourceContent', type, lang, brokerExternalId],
    queryFn: async () => {
      const url = getResourceUrl(type, lang, brokerExternalId);
      const response = await fetch(url);
      if (!response.ok) throw new Error('HTTP error: ' + response.status);

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        throw new Error('Unexpected content-type: ' + contentType);
      }

      return response.text();
    },
    enabled: Boolean(brokerExternalId),
    staleTime: Infinity
  });

export default {
  useResourceContent,
  getOrganizations,
  getOrganizationsPlain
};
