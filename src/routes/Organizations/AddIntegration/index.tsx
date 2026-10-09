import Typography from '@mui/material/Typography';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { FormComponent } from '@core/components/FormComponent';
import TitleComponent from '@core/components/TitleComponent/TitleComponent';
import WizardStepButtons from '@core/components/Wizard/WizardStepButtons';
import WizardStepWrapper from '@core/components/Wizard/WizardStepWrapper';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import Divider from '@mui/material/Divider';

enum IntegrationType {
  E_SERVICE = 'e-service',
  PAGOPA_PRODUCT = 'pagoPa-product',
  PDND_CLIENT = 'pdnd-client'
}

const addIntegrationSchema = z.object({
  flagIntegrationType: z.nativeEnum(IntegrationType, {
    errorMap: () => ({ message: 'commons.validation.selectAtLeastOneOption' })
  })
});

type AddIntegrationFormData = z.infer<typeof addIntegrationSchema>;

export const AddIntegration = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { control, handleSubmit } = useForm<AddIntegrationFormData>({
    resolver: zodResolver(addIntegrationSchema),
    mode: 'onSubmit',
    defaultValues: {
      // Forcing no selection on first render
      flagIntegrationType: '' as IntegrationType
    }
  });

  const onBack = () => {
    navigate(-1);
  };

  const onSubmit = (data: AddIntegrationFormData) => {
    // TODO: Handle form submission
    console.log(data);
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
          disabled={false}
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
      </WizardStepWrapper>
      <WizardStepButtons
        onBack={onBack}
        onNext={handleSubmit(onSubmit)}
        nextLabel={t('commons.confirm')}
        backLabel={t('commons.cancel')}
      />
    </>
  );
};
