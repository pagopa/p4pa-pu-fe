import { zodResolver } from '@hookform/resolvers/zod';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import type { SubmitErrorHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import {
  useCreatePdndService,
  useGetAllOrgSubUnits,
  useGetOrganizationApiKeys,
  useGetOrgSubUnitWithNoServiceType,
  useGetPdndClient,
  useGetPdndService,
  useSavePdndClient,
  useUpdatePdndClient,
  useUpdatePdndService
} from '@core/api/integrations';
import {
  encryptAndSaveApiKey,
  getOrganizationApiKey
} from '@core/api/organizations';
import GenericDialog from '@core/components/GenericDialog/GenericDialog';
import TitleComponent from '@core/components/TitleComponent/TitleComponent';
import WizardStepButtons from '@core/components/Wizard/WizardStepButtons';
import utils from '@core/utils';
import type { KeyTypeEnum } from '@generated/core/client';
import { OrganizationApiKeyType } from '@generated/core/client';

import {
  EServiceOwnerType,
  IntegrationMode,
  IntegrationType,
  PdndOwnerType
} from '../enums';
import PagoPAIntegration from './integrations/pagopa';
import type {
  AddIntegrationFormData,
  EServiceFormData,
  PagoPAFormData,
  PdndFormData
} from './AddIntegrationSchema';
import {
  isPagoPAKeyType,
  createAddIntegrationSchema,
  DEFAULT_PDND_VALUES,
  DEFAULT_ESERVICE_VALUES
} from './AddIntegrationSchema';
import { PdndClientIntegration } from './integrations/client';
import { IntegrationTypeSelector } from './components/IntegretionTypeSelector';
import { EServiceIntegration } from './integrations/eService';
import { PdndServiceType } from '@generated/core/data-contracts';

type AddIntegrationProps = {
  mode?: IntegrationMode;
};

export const AddIntegration = ({
  mode = IntegrationMode.ADD
}: AddIntegrationProps) => {
  const isEditMode = mode === IntegrationMode.EDIT;
  const isAddMode = mode === IntegrationMode.ADD;

  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    organizationId: organizationIdByURL,
    IntegrationType: integrationTypeByURL
  } = useParams<{
    organizationId: string;
    IntegrationType: IntegrationType;
  }>();
  const organizationId = Number(organizationIdByURL);

  const keyTypeByURL = searchParams.get('keyType');
  const initialKeyType = isPagoPAKeyType(keyTypeByURL)
    ? keyTypeByURL
    : undefined;
  const initialServiceEnabled = searchParams.get('serviceEnabled') === 'true';
  const purposeIdByURL = searchParams.get('purposeId') ?? undefined;
  const clientIdByURL = searchParams.get('clientId') ?? undefined;
  const subUnitCodeByURL = searchParams.get('subUnitCode') ?? undefined;

  const isEServiceEdit =
    isEditMode && integrationTypeByURL === IntegrationType.E_SERVICE;

  const isPdndClientEdit =
    isEditMode && integrationTypeByURL === IntegrationType.PDND_CLIENT;

  const { data: existingEService, isPending: isEServicePending } =
    useGetPdndService(
      organizationId,
      isEServiceEdit ? purposeIdByURL : undefined,
      subUnitCodeByURL
    );

  const { data: existingClient, isPending: isClientPending } = useGetPdndClient(
    organizationId,
    isPdndClientEdit ? clientIdByURL : undefined
  );

  const serviceSubUnitCode = existingEService?.subUnitCode ?? subUnitCodeByURL;
  const clientSubUnitCode = existingClient?.subUnitCode ?? subUnitCodeByURL;

  const { data: existingApiKeys } = useGetOrganizationApiKeys(
    organizationId,
    isAddMode
  );
  const { data: organizationApiKey } = getOrganizationApiKey(
    organizationId,
    initialKeyType,
    isEditMode
  );

  const availableApiKeys = existingApiKeys
    ? Object.values(OrganizationApiKeyType)
        .filter(
          (keyType) => !existingApiKeys.some((key) => key.keyType === keyType)
        )
        .filter((keyType) => keyType !== OrganizationApiKeyType.SEND)
    : [];

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

  const [eserviceToUpdate, setEServiceToUpdate] =
    useState<EServiceFormData | null>(null);
  const [pdndClientToUpdate, setPdndClientToUpdate] =
    useState<PdndFormData | null>(null);

  const noKeyAvailableToAdd = isAddMode && availableApiKeys.length === 0;

  const { data: orgSubUnitsWithNoServiceType } =
    useGetOrgSubUnitWithNoServiceType(organizationId, PdndServiceType.SEND);

  const canAddSendService =
    orgSubUnitsWithNoServiceType?.length &&
    orgSubUnitsWithNoServiceType?.length > 0;
  const schema = useMemo(
    () =>
      createAddIntegrationSchema(
        noKeyAvailableToAdd,
        !canAddSendService,
        isEditMode
      ),
    [noKeyAvailableToAdd, !canAddSendService, isEditMode]
  );

  // The API key and the e-service are loaded asynchronously, so the form is
  // seeded from this object: react-hook-form resets the form whenever it
  // changes, while `keepDirtyValues` preserves what the user typed meanwhile.
  const formValues = useMemo<AddIntegrationFormData>(
    () => ({
      flagIntegrationType: integrationTypeByURL,
      PAGOPA_PRODUCT: {
        keyType: initialKeyType,
        apiKey: organizationApiKey?.apiKey,
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
    }),
    [
      integrationTypeByURL,
      initialKeyType,
      initialServiceEnabled,
      organizationApiKey?.apiKey,
      purposeIdByURL,
      serviceSubUnitCode,
      existingEService,
      isPdndClientEdit,
      clientIdByURL,
      clientSubUnitCode,
      existingClient
    ]
  );

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors }
  } = useForm<AddIntegrationFormData>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    values: formValues,
    resetOptions: { keepDirtyValues: true }
  });

  const flagIntegrationType = watch('flagIntegrationType');

  const pdndOwnerType = watch('PDND_CLIENT.ownerType');

  // Sub-units are needed when the PDND client belongs to a sub-unit and, in
  // edit mode, to show the full sub-unit list of an e-service or client.
  const { data: subUnits } = useGetAllOrgSubUnits(
    organizationId,
    isEServiceEdit ||
      isPdndClientEdit ||
      (flagIntegrationType === IntegrationType.PDND_CLIENT &&
        pdndOwnerType === PdndOwnerType.SUB_UNIT)
  );

  // Re-validate the selected type when the number of available keys changes.
  useEffect(() => {
    if (flagIntegrationType !== undefined) {
      void trigger('flagIntegrationType');
    }
  }, [flagIntegrationType, availableApiKeys.length, trigger]);

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

  const onBack = () => navigate(-1);

  const onSubmit = async (formData: AddIntegrationFormData) => {
    try {
      switch (formData.flagIntegrationType) {
        case IntegrationType.PAGOPA_PRODUCT:
          await submitPagoPA(formData.PAGOPA_PRODUCT);
          break;
        case IntegrationType.PDND_CLIENT:
          if (isPdndClientEdit) {
            setPdndClientToUpdate(formData.PDND_CLIENT ?? null);
            return;
          }
          await submitPdnd(formData.PDND_CLIENT);
          break;
        case IntegrationType.E_SERVICE:
          if (isEServiceEdit) {
            setEServiceToUpdate(formData.E_SERVICE ?? null);
            return;
          }
          await submitEService(formData.E_SERVICE);
          break;
        default:
          return;
      }
      navigate(-1);
      utils.notify.emit(t('commons.done'), 'success');
    } catch (error) {
      utils.notify.emit(t('integrations.add.errors.saveIntegration.message'));
      console.error(error);
    }
  };

  const onConfirmEServiceUpdate = async () => {
    try {
      await submitEService(eserviceToUpdate ?? undefined);
      utils.notify.emit(t('commons.done'), 'success');
      navigate(-1);
    } catch (error) {
      utils.notify.emit(t('integrations.add.errors.saveIntegration.message'));
      console.error(error);
    } finally {
      setEServiceToUpdate(null);
    }
  };

  const onConfirmPdndClientUpdate = async () => {
    try {
      await submitPdnd(pdndClientToUpdate ?? undefined);
      utils.notify.emit(t('commons.done'), 'success');
      navigate(-1);
    } catch (error) {
      utils.notify.emit(t('integrations.add.errors.saveIntegration.message'));
      console.error(error);
    } finally {
      setPdndClientToUpdate(null);
    }
  };

  const onInvalidSubmit: SubmitErrorHandler<AddIntegrationFormData> = (
    formErrors
  ) => {
    console.log(formErrors);
    if (formErrors.flagIntegrationType) return;
    const apiKeyError = formErrors.PAGOPA_PRODUCT?.apiKey;
    if (apiKeyError?.message) {
      utils.notify.emit(t(apiKeyError.message));
    }
  };

  const showPagoPAForm =
    flagIntegrationType === IntegrationType.PAGOPA_PRODUCT &&
    (isEditMode || availableApiKeys.length > 0);

  const showPdndForm = flagIntegrationType === IntegrationType.PDND_CLIENT;

  const showEServicePdndForm =
    flagIntegrationType === IntegrationType.E_SERVICE &&
    (isEServiceEdit || canAddSendService);

  return (
    <>
      <TitleComponent
        title={t(`integrations.${mode}.title`)}
        description={t(`integrations.${mode}.subtitle`)}
      />
      <Typography variant="body1" color="error" sx={{ marginBottom: 2 }}>
        {t('commons.requiredFieldDescriptionShort')}
      </Typography>

      {isAddMode && (
        <IntegrationTypeSelector
          control={control}
          value={flagIntegrationType}
          errorMessage={errors.flagIntegrationType?.message}
        />
      )}

      {showPagoPAForm && (
        <PagoPAIntegration
          availableApiKeys={availableApiKeys}
          control={control}
          readOnly={isEditMode}
        />
      )}

      {showPdndForm && (
        <PdndClientIntegration
          control={control}
          organizationName={String(organizationId)}
          subUnits={subUnits?.content}
          editMode={isPdndClientEdit}
        />
      )}

      {showEServicePdndForm && (
        <EServiceIntegration
          organizationId={organizationId}
          control={control}
          orgSubUnitsWithNoServiceType={orgSubUnitsWithNoServiceType}
          subUnits={subUnits?.content}
          editMode={isEServiceEdit}
          serviceSubUnitCode={serviceSubUnitCode}
          serviceSubUnitName={existingEService?.subUnitName}
        />
      )}

      <WizardStepButtons
        onBack={onBack}
        onNext={handleSubmit(onSubmit, onInvalidSubmit)}
        nextLabel={t('commons.confirm')}
        backLabel={t('commons.cancel')}
        disableNext={
          (isEServiceEdit && isEServicePending) ||
          (isPdndClientEdit && isClientPending)
        }
      />

      {eserviceToUpdate && (
        <GenericDialog
          open
          data-testid="confirm-eservice-update-dialog"
          title={t('integrations.edit.confirmDialog.title')}
          message={t('integrations.edit.confirmDialog.message')}
          confirmLabel={t('commons.confirm')}
          cancelLabel={t('commons.cancel')}
          confirmLoading={updatePdndServiceMutation.isPending}
          onConfirm={onConfirmEServiceUpdate}
          onClose={() => {
            if (!updatePdndServiceMutation.isPending) {
              setEServiceToUpdate(null);
            }
          }}
        />
      )}

      {pdndClientToUpdate && (
        <GenericDialog
          open
          data-testid="confirm-pdnd-client-update-dialog"
          title={t('integrations.edit.confirmDialog.title')}
          message={t('integrations.edit.confirmDialog.message')}
          confirmLabel={t('commons.confirm')}
          cancelLabel={t('commons.cancel')}
          confirmLoading={updateClientMutation.isPending}
          onConfirm={onConfirmPdndClientUpdate}
          onClose={() => {
            if (!updateClientMutation.isPending) {
              setPdndClientToUpdate(null);
            }
          }}
        />
      )}
    </>
  );
};
