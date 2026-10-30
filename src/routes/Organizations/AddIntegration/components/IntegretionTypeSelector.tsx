import { FormComponent } from '@core/components/FormComponent';
import WizardStepWrapper from '@core/components/Wizard/WizardStepWrapper';
import type { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IntegrationType } from '../../enums';
import type { AddIntegrationFormData } from '../AddIntegrationSchema';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

type IntegrationTypeSelectorProps = {
  control: Control<AddIntegrationFormData>;
  value?: IntegrationType;
  errorMessage?: string;
};

export const IntegrationTypeSelector = ({
  control,
  value,
  errorMessage
}: IntegrationTypeSelectorProps) => {
  const { t } = useTranslation();

  return (
    <WizardStepWrapper p={2}>
      <Typography variant="h6" component="h2" mb={2}>
        {t('integrations.add.section')}
      </Typography>
      <FormComponent.ControlledRadioGroup
        formControlLabelProps={{
          labelPlacement: 'start',
          sx: { width: '100%', mx: 0, justifyContent: 'space-between' }
        }}
        divider={<Divider sx={{ my: 1 }} />}
        name="flagIntegrationType"
        data-testid="integration-type-radio-group"
        aria-label={t('integrations.add.section')}
        control={control}
        value={value ?? ''}
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
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>{t(`${errorMessage}.title`)}</AlertTitle>
          {t(`${errorMessage}.message`)}
        </Alert>
      )}
    </WizardStepWrapper>
  );
};
