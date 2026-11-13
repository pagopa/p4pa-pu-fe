import { zodResolver } from '@hookform/resolvers/zod';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo } from 'react';
import type { SubmitErrorHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import {
  useGetAllOrgSubUnits,
  useGetOrganizationApiKeys,
  useGetOrgSubUnitWithNoServiceType,
  useGetPdndClient,
  useGetPdndService
} from '@core/api/integrations';
import { getOrganizationApiKey } from '@core/api/organizations';
import TitleComponent from '@core/components/TitleComponent/TitleComponent';
import WizardStepButtons from '@core/components/Wizard/WizardStepButtons';
import utils from '@core/utils';
import { PdndServiceType } from '@generated/core/data-contracts';

import { IntegrationMode, IntegrationType, PdndOwnerType } from '../enums';
import PagoPAIntegration from './integrations/pagopa';
import type { AddIntegrationFormData } from './AddIntegrationSchema';
import { createAddIntegrationSchema } from './AddIntegrationSchema';
import { PdndClientIntegration } from './integrations/client';
import { IntegrationTypeSelector } from './components/IntegretionTypeSelector';
import { EServiceIntegration } from './integrations/eService';
import { buildFormValues } from './buildFormValues';
import { ConfirmUpdateDialog } from './components/ConfirmUpdateDialog';
import { useIntegrationSave } from './useIntegrationSave';
import {
  getAvailableApiKeys,
  parseIntegrationParams
} from './integrationParams';

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

  const {
    initialKeyType,
    initialServiceEnabled,
    purposeIdByURL,
    clientIdByURL,
    subUnitCodeByURL
  } = parseIntegrationParams(searchParams);

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

  const availableApiKeys = getAvailableApiKeys(existingApiKeys);

  const {
    pendingUpdate,
    submit,
    confirmUpdate,
    cancelUpdate,
    isUpdatePending
  } = useIntegrationSave({
    organizationId,
    isEServiceEdit,
    isPdndClientEdit,
    clientIdByURL,
    purposeIdByURL,
    serviceSubUnitCode
  });

  const noKeyAvailableToAdd = isAddMode && availableApiKeys.length === 0;

  const { data: orgSubUnitsWithNoServiceType } =
    useGetOrgSubUnitWithNoServiceType(organizationId, PdndServiceType.SEND);

  const canAddSendService = (orgSubUnitsWithNoServiceType?.length ?? 0) > 0;
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
  const formValues = useMemo(
    () =>
      buildFormValues({
        integrationType: integrationTypeByURL,
        initialKeyType,
        initialServiceEnabled,
        organizationApiKey: organizationApiKey?.apiKey,
        purposeIdByURL,
        existingEService,
        serviceSubUnitCode,
        isPdndClientEdit,
        clientIdByURL,
        clientSubUnitCode,
        existingClient
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

  const onBack = () => navigate(-1);

  const onInvalidSubmit: SubmitErrorHandler<AddIntegrationFormData> = (
    formErrors
  ) => {
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
        onNext={handleSubmit(submit, onInvalidSubmit)}
        nextLabel={t('commons.confirm')}
        backLabel={t('commons.cancel')}
        disableNext={
          (isEServiceEdit && isEServicePending) ||
          (isPdndClientEdit && isClientPending)
        }
      />

      {pendingUpdate && (
        <ConfirmUpdateDialog
          type={pendingUpdate.type}
          confirmLoading={isUpdatePending}
          onConfirm={confirmUpdate}
          onCancel={cancelUpdate}
        />
      )}
    </>
  );
};
