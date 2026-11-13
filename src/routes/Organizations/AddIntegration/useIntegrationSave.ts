import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
  useCreatePdndService,
  useSavePdndClient,
  useUpdatePdndClient,
  useUpdatePdndService
} from '@core/api/integrations';
import { encryptAndSaveApiKey } from '@core/api/organizations';
import utils from '@core/utils';
import type { KeyTypeEnum } from '@generated/core/client';
import { OrganizationApiKeyType } from '@generated/core/client';
import { PdndServiceType } from '@generated/core/data-contracts';

import { EServiceOwnerType, IntegrationType, PdndOwnerType } from '../enums';
import type {
  AddIntegrationFormData,
  EServiceFormData,
  PagoPAFormData,
  PdndFormData,
  PendingUpdate
} from './AddIntegrationSchema';

type UseIntegrationSaveParams = {
  organizationId: number;
  isEServiceEdit: boolean;
  isPdndClientEdit: boolean;
  clientIdByURL?: string;
  purposeIdByURL?: string;
  serviceSubUnitCode?: string;
};

/**
 * Save flow of the add/edit integration wizard: picks the right API call for
 * the selected integration type, asks for confirmation before updating an
 * existing resource and keeps the confirmation dialog open when a save fails.
 */
export const useIntegrationSave = ({
  organizationId,
  isEServiceEdit,
  isPdndClientEdit,
  clientIdByURL,
  purposeIdByURL,
  serviceSubUnitCode
}: UseIntegrationSaveParams) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const savePagoPAMutation = encryptAndSaveApiKey(organizationId);
  const saveClientMutation = useSavePdndClient(organizationId);
  const updateClientMutation = useUpdatePdndClient(
    organizationId,
    clientIdByURL ?? ''
  );
  const createPdndServiceMutation = useCreatePdndService(organizationId);
  const updatePdndServiceMutation = useUpdatePdndService(
    organizationId,
    purposeIdByURL ?? '',
    serviceSubUnitCode
  );

  const [pendingUpdate, setPendingUpdate] = useState<PendingUpdate | null>(
    null
  );

  const notifySaveError = (error: unknown) => {
    utils.notify.emit(t('integrations.add.errors.saveIntegration.message'));
    console.error(error);
  };

  // Resolves to `true` only when the save succeeds, so callers can keep
  // their own state (e.g. the confirmation dialog) on failure.
  const saveAndNavigate = async (save: () => Promise<void>) => {
    try {
      await save();
      utils.notify.emit(t('commons.done'), 'success');
      navigate(-1);
      return true;
    } catch (error) {
      notifySaveError(error);
      return false;
    }
  };

  const submitPagoPA = async (values?: PagoPAFormData) => {
    if (!values?.apiKey || !values.keyType) {
      throw new Error('Missing API key or type for PagoPA product');
    }
    await savePagoPAMutation.mutateAsync({
      apiKey: values.apiKey,
      keyType: values.keyType as unknown as KeyTypeEnum,
      // serviceEnabled applies only to IO keys
      ...(values.keyType === OrganizationApiKeyType.IO && {
        serviceEnabled: values.serviceEnabled ?? false
      })
    });
  };

  const submitPdnd = async (values?: PdndFormData) => {
    const { clientName, clientId, kid, publicKey, privateKey } = values ?? {};

    if (!clientName || !clientId || !kid || !publicKey || !privateKey) {
      throw new Error('Missing data for PDND client');
    }

    const subUnitCode =
      values?.ownerType === PdndOwnerType.SUB_UNIT
        ? values.subUnitCode
        : undefined;

    if (isPdndClientEdit) {
      if (!clientIdByURL) {
        throw new Error('Missing client ID for PDND client update');
      }
      await updateClientMutation.mutateAsync({
        organizationId,
        clientName,
        kid,
        publicKey,
        privateKey,
        // Keep the client associated with its sub-unit, if any.
        ...(subUnitCode && { subUnitCode })
      });
      return;
    }

    await saveClientMutation.mutateAsync({
      organizationId,
      clientName,
      clientId,
      kid,
      publicKey,
      privateKey,
      // subUnitCode is sent only when the client belongs to a sub-unit
      ...(subUnitCode && { subUnitCode })
    });
  };

  const submitEService = async (values?: EServiceFormData) => {
    const { eServiceName, purposeId, clientId, ownerType } = values ?? {};

    if (!eServiceName || !clientId || !ownerType) {
      throw new Error('Missing data for eService integration');
    }

    if (isEServiceEdit) {
      if (!purposeIdByURL) {
        throw new Error('Missing purpose ID for eService update');
      }
      await updatePdndServiceMutation.mutateAsync({
        serviceName: eServiceName,
        clientId
      });
      return;
    }

    if (!purposeId) {
      throw new Error('Missing purpose ID for eService integration');
    }

    await createPdndServiceMutation.mutateAsync({
      data: {
        serviceName: eServiceName,
        serviceType: PdndServiceType.SEND,
        purposeId,
        clientId
      },
      subUnitCode:
        values?.ownerType === EServiceOwnerType.SUB_UNIT
          ? values.subUnitCode
          : undefined
    });
  };

  // In edit mode the update must be confirmed by the user before being saved.
  const getRequestedUpdate = (
    formData: AddIntegrationFormData
  ): PendingUpdate | null => {
    if (
      isPdndClientEdit &&
      formData.flagIntegrationType === IntegrationType.PDND_CLIENT &&
      formData.PDND_CLIENT
    ) {
      return { type: 'pdndClient', values: formData.PDND_CLIENT };
    }
    if (
      isEServiceEdit &&
      formData.flagIntegrationType === IntegrationType.E_SERVICE &&
      formData.E_SERVICE
    ) {
      return { type: 'eservice', values: formData.E_SERVICE };
    }
    return null;
  };

  const getSaveAction = (
    formData: AddIntegrationFormData
  ): (() => Promise<void>) | undefined => {
    switch (formData.flagIntegrationType) {
      case IntegrationType.PAGOPA_PRODUCT:
        return async () => submitPagoPA(formData.PAGOPA_PRODUCT);
      case IntegrationType.PDND_CLIENT:
        return async () => submitPdnd(formData.PDND_CLIENT);
      case IntegrationType.E_SERVICE:
        return async () => submitEService(formData.E_SERVICE);
      default:
        return undefined;
    }
  };

  const submit = async (formData: AddIntegrationFormData) => {
    const requestedUpdate = getRequestedUpdate(formData);
    if (requestedUpdate) {
      setPendingUpdate(requestedUpdate);
      return;
    }

    const saveAction = getSaveAction(formData);
    if (saveAction) {
      await saveAndNavigate(saveAction);
    }
  };

  const confirmUpdate = async () => {
    if (!pendingUpdate) {
      return;
    }

    const { type, values } = pendingUpdate;
    // Keep the dialog open on failure so the user can retry (or cancel).
    const saved = await saveAndNavigate(() =>
      type === 'eservice' ? submitEService(values) : submitPdnd(values)
    );
    if (saved) {
      setPendingUpdate(null);
    }
  };

  const cancelUpdate = () => setPendingUpdate(null);

  const updateMutationByType = {
    eservice: updatePdndServiceMutation,
    pdndClient: updateClientMutation
  };

  const isUpdatePending = pendingUpdate
    ? updateMutationByType[pendingUpdate.type].isPending
    : false;

  return {
    pendingUpdate,
    submit,
    confirmUpdate,
    cancelUpdate,
    isUpdatePending
  };
};
