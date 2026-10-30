import { zodResolver } from '@hookform/resolvers/zod';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo } from 'react';
import type { SubmitErrorHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import {
  getAllOrgSubUnits,
  getOrganizationApiKeys,
  savePdndClient
} from '@core/api/integrations';
import {
  encryptAndSaveApiKey,
  getOrganizationApiKey
} from '@core/api/organizations';
import TitleComponent from '@core/components/TitleComponent/TitleComponent';
import WizardStepButtons from '@core/components/Wizard/WizardStepButtons';
import utils from '@core/utils';
import type { KeyTypeEnum } from '@generated/core/client';
import { OrganizationApiKeyType } from '@generated/core/client';

import { IntegrationMode, IntegrationType, PdndOwnerType } from '../enums';
import PagoPAIntegration from './integrations/pagopa';
import type {
  AddIntegrationFormData,
  PagoPAFormData,
  PdndFormData
} from './AddIntegrationSchema';
import {
  isPagoPAKeyType,
  createAddIntegrationSchema,
  DEFAULT_PDND_VALUES
} from './AddIntegrationSchema';
import { PdndClientIntegration } from './integrations/client';
import { IntegrationTypeSelector } from './components/IntegretionTypeSelector';

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

  const { data: existingApiKeys } = getOrganizationApiKeys(
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
  const saveClientMutation = savePdndClient(organizationId);

  const noKeyAvailableToAdd = isAddMode && availableApiKeys.length === 0;
  const schema = useMemo(
    () => createAddIntegrationSchema(noKeyAvailableToAdd),
    [noKeyAvailableToAdd]
  );

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    resetField,
    getFieldState,
    formState: { errors }
  } = useForm<AddIntegrationFormData>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues: {
      flagIntegrationType: integrationTypeByURL,
      PAGOPA_PRODUCT: {
        keyType: initialKeyType,
        apiKey: organizationApiKey?.apiKey,
        serviceEnabled: initialServiceEnabled
      },
      PDND_CLIENT: DEFAULT_PDND_VALUES
    }
  });

  const flagIntegrationType = watch('flagIntegrationType');
  const pdndOwnerType = watch('PDND_CLIENT.ownerType');

  // Sub-units are needed only when the PDND client belongs to a sub-unit
  const { data: subUnits } = getAllOrgSubUnits(
    organizationId,
    flagIntegrationType === IntegrationType.PDND_CLIENT &&
      pdndOwnerType === PdndOwnerType.SUB_UNIT
  );

  // In edit mode the API key is loaded asynchronously: sync it into the form
  // unless the user has already typed something.
  useEffect(() => {
    if (
      isEditMode &&
      organizationApiKey?.apiKey !== undefined &&
      !getFieldState('PAGOPA_PRODUCT.apiKey').isDirty
    ) {
      resetField('PAGOPA_PRODUCT.apiKey', {
        defaultValue: organizationApiKey.apiKey
      });
    }
  }, [isEditMode, organizationApiKey?.apiKey, resetField, getFieldState]);

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

    await saveClientMutation.mutateAsync({
      organizationId,
      clientName,
      clientId,
      kid,
      publicKey,
      privateKey,
      // subUnitCode is sent only when the client belongs to a sub-unit
      ...(values?.ownerType === PdndOwnerType.SUB_UNIT && {
        subUnitCode: values.subUnitCode
      })
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
          await submitPdnd(formData.PDND_CLIENT);
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
        />
      )}

      <WizardStepButtons
        onBack={onBack}
        onNext={handleSubmit(onSubmit, onInvalidSubmit)}
        nextLabel={t('commons.confirm')}
        backLabel={t('commons.cancel')}
      />
    </>
  );
};
