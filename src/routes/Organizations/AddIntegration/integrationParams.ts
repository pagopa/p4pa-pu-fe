import type { OrganizationApiKey } from '@generated/core/data-contracts';

import type { PagoPAKeyType } from './AddIntegrationSchema';
import { PAGOPA_KEY_TYPES, isPagoPAKeyType } from './AddIntegrationSchema';

export type IntegrationParams = {
  initialKeyType?: PagoPAKeyType;
  initialServiceEnabled: boolean;
  purposeIdByURL?: string;
  clientIdByURL?: string;
  subUnitCodeByURL?: string;
};

// Values carried by the query string when entering the wizard, e.g. from the
// integrations lists or from the edit action of a row.
export const parseIntegrationParams = (
  searchParams: URLSearchParams
): IntegrationParams => {
  const keyTypeByURL = searchParams.get('keyType');

  return {
    initialKeyType: isPagoPAKeyType(keyTypeByURL) ? keyTypeByURL : undefined,
    initialServiceEnabled: searchParams.get('serviceEnabled') === 'true',
    purposeIdByURL: searchParams.get('purposeId') ?? undefined,
    clientIdByURL: searchParams.get('clientId') ?? undefined,
    subUnitCodeByURL: searchParams.get('subUnitCode') ?? undefined
  };
};

// Only the PagoPA key types that are still free for the organization can be
// added. The SEND key is managed by the SEND module, so it is never offered.
export const getAvailableApiKeys = (
  existingApiKeys?: Array<OrganizationApiKey>
): Array<PagoPAKeyType> =>
  existingApiKeys
    ? PAGOPA_KEY_TYPES.filter(
        (keyType) => !existingApiKeys.some((key) => key.keyType === keyType)
      )
    : [];
