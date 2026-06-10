import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import config from './config';
import { getResourceUrl } from './resources';

describe('getResourceUrl', () => {
  const resourcesUrl = config.resourcesUrl;

  beforeEach(() => {
    config.resourcesUrl =
      '/piattaformaunitaria-legaldocs/{BROKER_EXTERNAL_ID}/{DOCUMENT_TYPE}/{DOC_LANGUAGE}_{DOCUMENT_TYPE}.md';
  });

  afterEach(() => {
    config.resourcesUrl = resourcesUrl;
  });

  it('uses broker externalId from loader data', () => {
    expect(getResourceUrl('tos', 'en-US', 'broker-external-id')).toBe(
      `${window.location.origin}/piattaformaunitaria-legaldocs/broker-external-id/tos/en_tos.md`
    );
  });

  it('resolves absolute resource URLs without prepending the origin', () => {
    config.resourcesUrl =
      'https://example.com/{BROKER_EXTERNAL_ID}/{DOCUMENT_TYPE}/{DOC_LANGUAGE}';

    expect(getResourceUrl('pp', 'it', 'broker-external-id')).toBe(
      'https://example.com/broker-external-id/pp/it'
    );
  });
});
