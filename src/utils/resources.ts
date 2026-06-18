import config from './config';

export type ResourceType = 'tos' | 'pp';

/**
 * Resolves the template URL for legal resources (ToS, PP)
 * by replacing the {BROKER_EXTERNAL_ID}, {DOCUMENT_TYPE} and {DOC_LANGUAGE} placeholders.
 *
 * If the resolved URL is a relative path (no host), the current
 * window.location.origin is prepended so the fetch works regardless
 * of whether a full URL or an absolute path was configured.
 *
 * @param type - The resource type: 'tos' or 'pp'
 * @param lang - The language code (defaults to 'it')
 * @param brokerExternalId - The broker external identifier
 * @returns The fully resolved URL
 */
export const getResourceUrl = (
  type: ResourceType,
  lang = 'it',
  brokerExternalId = ''
): string => {
  const shortLang = lang.split(/[-_]/)[0];

  const resolved = config.resourcesUrl
    .replace('{BROKER_EXTERNAL_ID}', brokerExternalId)
    .replace(new RegExp('{DOCUMENT_TYPE}', 'g'), type)
    .replace('{DOC_LANGUAGE}', shortLang);

  if (resolved.startsWith('/')) {
    return window.location.origin + resolved;
  }

  return resolved;
};
