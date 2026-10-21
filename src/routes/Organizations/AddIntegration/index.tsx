import Typography from '@mui/material/Typography';
import { SubmitErrorHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { FormComponent } from '@core/components/FormComponent';
import TitleComponent from '@core/components/TitleComponent/TitleComponent';
import WizardStepButtons from '@core/components/Wizard/WizardStepButtons';
import WizardStepWrapper from '@core/components/Wizard/WizardStepWrapper';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import Divider from '@mui/material/Divider';
import PagoPAIntegration from './integrations/pagopa';
import { KeyTypeEnum, OrganizationApiKeyType } from '@generated/core/client';
import { getOrganizationApiKeys } from '@core/api/integrations';
import { Alert, AlertTitle } from '@mui/material';
import { useEffect } from 'react';
import utils from '@core/utils';
import i18n from '@core/translations/i18n';
import { encryptAndSaveApiKey } from '@core/api/organizations';

enum IntegrationType {
  E_SERVICE = 'e-service',
  PAGOPA_PRODUCT = 'pagoPa-product',
  PDND_CLIENT = 'pdnd-client'
}

const addIntegrationSchema = z.object({
  flagIntegrationType: z
    .nativeEnum(IntegrationType, {
      errorMap: () => ({ message: 'commons.validation.selectAtLeastOneOption' })
    })
    .optional()
    .superRefine((value) => {
      if (value === undefined) {
        utils.notify.emit(
          i18n.t('integrations.add.errors.selectAtLeastOneOption.title')
        );
      }
    }),
  PAGOPA_PRODUCT: z
    .object({
      keyType: z
        .union([
          z.literal(OrganizationApiKeyType.IO),
          z.literal(OrganizationApiKeyType.GENERATE_NOTICE)
        ])
        .optional(),
      apiKey: z.string().optional(),
      serviceEnabled: z.boolean().optional()
    })
    .optional()
});

export type AddIntegrationFormData = z.infer<typeof addIntegrationSchema>;

export const AddIntegration = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { organizationId: organizationIdByURL } = useParams<{
    organizationId: string;
  }>();

  const organizationId = Number(organizationIdByURL);
  const { data } = getOrganizationApiKeys(organizationId);

  const availableApiKeys = data
    ? Object.values(OrganizationApiKeyType)
        .filter((keyType) => !data.some((key) => key.keyType === keyType))
        .filter((keyType) => keyType !== OrganizationApiKeyType.SEND)
    : [];

  const savedIntegrationTypeMutation = encryptAndSaveApiKey(organizationId);

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors }
  } = useForm<AddIntegrationFormData>({
    resolver: zodResolver(
      addIntegrationSchema.superRefine((values, ctx) => {
        if (
          values.flagIntegrationType === IntegrationType.PAGOPA_PRODUCT &&
          availableApiKeys.length === 0
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['flagIntegrationType'],
            message:
              'integrations.add.pagoPaProduct.errors.noIntegrationAvailable'
          });
        }
        if (
          values.flagIntegrationType === IntegrationType.PAGOPA_PRODUCT &&
          !values.PAGOPA_PRODUCT?.apiKey
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['PAGOPA_PRODUCT', 'apiKey'],
            message: 'integrations.add.pagoPaProduct.errors.apiKey.title'
          });
        }
      })
    ),
    mode: 'onSubmit',
    defaultValues: {
      flagIntegrationType: undefined,
      PAGOPA_PRODUCT: {
        keyType: undefined,
        apiKey: '',
        serviceEnabled: false
      }
    }
  });

  const flagIntegrationType = watch('flagIntegrationType');

  useEffect(() => {
    if (flagIntegrationType !== undefined) {
      void trigger('flagIntegrationType');
    }
  }, [flagIntegrationType, availableApiKeys.length, trigger]);

  const onBack = () => {
    navigate(-1);
  };

  const onSubmit = async (data: AddIntegrationFormData) => {
    try {
      if (data.flagIntegrationType === IntegrationType.PAGOPA_PRODUCT) {
        if (!data.PAGOPA_PRODUCT?.apiKey || !data.PAGOPA_PRODUCT?.keyType) {
          throw new Error('Missing API key or type for PagoPA product');
        }
        await savedIntegrationTypeMutation.mutateAsync({
          apiKey: data.PAGOPA_PRODUCT.apiKey,
          keyType: data.PAGOPA_PRODUCT.keyType as unknown as KeyTypeEnum,
          ...(data.PAGOPA_PRODUCT.keyType === OrganizationApiKeyType.IO && {
            serviceEnabled: data.PAGOPA_PRODUCT.serviceEnabled ?? false
          })
        });
        navigate(-1);
        utils.notify.emit(t('commons.done'), 'success');
      }
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

  return (
    <>
      <TitleComponent
        title={t('integrations.add.title')}
        description={t('integrations.add.subtitle')}
      />
      <Typography variant="body1" color="error" sx={{ marginBottom: 2 }}>
        {t('commons.requiredFieldDescription')}
      </Typography>
      <WizardStepWrapper p={2}>
        <Typography variant="h6" component="h2" mb={2}>
          {t('integrations.add.section')}
        </Typography>
        <FormComponent.ControlledRadioGroup
          formControlLabelProps={{
            labelPlacement: 'start',
            sx: {
              width: '100%',
              mx: 0,
              justifyContent: 'space-between'
            }
          }}
          divider={<Divider sx={{ my: 1 }} />}
          name="flagIntegrationType"
          data-testid="flagNotifyOutcomePush"
          control={control}
          value={flagIntegrationType ?? ''}
          disabled={false}
          selectFirstOption={false}
          showErrorMessage={false}
          options={[
            {
              value: IntegrationType.PAGOPA_PRODUCT,
              label: (
                <FormComponent.RadioLabel
                  label={t('integrations.add.pagoPaProduct.label')}
                  description={t('integrations.add.pagoPaProduct.description')}
                />
              )
            },
            {
              value: IntegrationType.E_SERVICE,
              label: (
                <FormComponent.RadioLabel
                  label={t('integrations.add.eService.label')}
                  description={t('integrations.add.eService.description')}
                />
              )
            },
            {
              value: IntegrationType.PDND_CLIENT,
              label: (
                <FormComponent.RadioLabel
                  label={t('integrations.add.pdndClient.label')}
                />
              )
            }
          ]}
        />
        {errors.flagIntegrationType?.message && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>
              {t(`${errors.flagIntegrationType.message}.title`)}
            </AlertTitle>
            {t(`${errors.flagIntegrationType.message}.message`)}
          </Alert>
        )}
      </WizardStepWrapper>
      {availableApiKeys.length > 0 &&
        flagIntegrationType === IntegrationType.PAGOPA_PRODUCT && (
          <PagoPAIntegration
            availableApiKeys={availableApiKeys}
            control={control}
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
