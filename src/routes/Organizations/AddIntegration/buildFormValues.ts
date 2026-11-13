import type {
  PdndClientNoSecretDTO,
  PdndServiceView
} from '@generated/core/data-contracts';

import type { IntegrationType } from '../enums';
import { EServiceOwnerType, PdndOwnerType } from '../enums';
import type {
  AddIntegrationFormData,
  PagoPAKeyType
} from './AddIntegrationSchema';
import {
  DEFAULT_ESERVICE_VALUES,
  DEFAULT_PDND_VALUES
} from './AddIntegrationSchema';

type BuildFormValuesParams = {
  integrationType?: IntegrationType;
  initialKeyType?: PagoPAKeyType;
  initialServiceEnabled: boolean;
  organizationApiKey?: string;
  purposeIdByURL?: string;
  existingEService?: PdndServiceView;
  serviceSubUnitCode?: string;
  isPdndClientEdit: boolean;
  clientIdByURL?: string;
  clientSubUnitCode?: string;
  existingClient?: PdndClientNoSecretDTO;
};

// The API key and the e-service are loaded asynchronously, so the form is
// seeded from this object: react-hook-form resets the form whenever it
// changes, while `keepDirtyValues` preserves what the user typed meanwhile.
export const buildFormValues = ({
  integrationType,
  initialKeyType,
  initialServiceEnabled,
  organizationApiKey,
  purposeIdByURL,
  existingEService,
  serviceSubUnitCode,
  isPdndClientEdit,
  clientIdByURL,
  clientSubUnitCode,
  existingClient
}: BuildFormValuesParams): AddIntegrationFormData => ({
  flagIntegrationType: integrationType,
  PAGOPA_PRODUCT: {
    keyType: initialKeyType,
    apiKey: organizationApiKey,
    serviceEnabled: initialServiceEnabled
  },
  E_SERVICE: {
    ...DEFAULT_ESERVICE_VALUES,
    // Read-only in edit mode, where it comes from the URL.
    purposeId: purposeIdByURL ?? DEFAULT_ESERVICE_VALUES.purposeId,
    ownerType: serviceSubUnitCode
      ? EServiceOwnerType.SUB_UNIT
      : DEFAULT_ESERVICE_VALUES.ownerType,
    subUnitCode: serviceSubUnitCode ?? '',
    // In edit mode the changeable fields start from the loaded service.
    ...(existingEService && {
      eServiceName: existingEService.serviceName,
      clientId: existingEService.clientId ?? ''
    })
  },
  PDND_CLIENT: {
    ...DEFAULT_PDND_VALUES,
    // In edit mode the owner and the sub-unit are read-only and come from
    // the loaded client (or from the URL).
    ...(isPdndClientEdit && {
      ownerType: clientSubUnitCode
        ? PdndOwnerType.SUB_UNIT
        : PdndOwnerType.ORGANIZATION,
      subUnitCode: clientSubUnitCode ?? '',
      clientId: clientIdByURL ?? '',
      // The changeable fields start from the loaded client. The private
      // key is never returned by the API, so it must be entered again.
      ...(existingClient && {
        clientName: existingClient.clientName,
        kid: existingClient.kid,
        publicKey: existingClient.publicKey
      })
    })
  }
});
