import { Grid, Typography, Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import WizardStepButtons from '../../../../../components/Wizard/WizardStepButtons';
import {
  UnifiedFormData,
  UnifiedFormValues
} from '../../../../../models/OrganizationEditTypes';
import { theme } from '@pagopa/mui-italia';
import { AccountingInfoSection } from './sections/AccountingInfoSection';
import { PaymentsInfoSection } from './sections/PaymentsInfoSection';
import { PagoPAIntegrationSection } from './sections/PagoPAIntegrationSection';
import { createIBANValidationRules } from '../../../../../utils/validationRules';
import {
  mapStep2ValuesToFieldData,
  unifiedFormDataToFormValues
} from '../../../../../utils/organizationFormTransformers';

type Props = {
  data: UnifiedFormData;
  setData: (data: UnifiedFormData) => void;
  onNext: (data?: UnifiedFormData, enableOrg?: boolean) => void;
  onBack: () => void;
};

const formValuesToFieldData = (
  values: UnifiedFormValues,
  originalData: UnifiedFormData
): UnifiedFormData => {
  const step2Data = mapStep2ValuesToFieldData(values, originalData);

  return {
    // Step 1 fields - preserve original values
    orgName: originalData.orgName,
    orgFiscalCode: originalData.orgFiscalCode,
    orgEmail: originalData.orgEmail,
    orgLogo: originalData.orgLogo,
    logoRemoved: originalData.logoRemoved,
    // Step 2 fields (Accounting, Payments, PagoPA Integration)
    ...step2Data,
    organizationStatus: originalData.organizationStatus
  };
};

const Step2EntityConfiguration = ({ data, setData, onNext, onBack }: Props) => {
  const { t } = useTranslation();

  // Calculate initial values dynamically to sync with parent data changes
  const getInitialValues = (): UnifiedFormValues => {
    // Logo is handled separately in this step, keep it explicitly null here
    return unifiedFormDataToFormValues(data, { logoFile: null });
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch
  } = useForm<UnifiedFormValues>({
    defaultValues: getInitialValues(),
    values: getInitialValues(), // This ensures form updates when data changes
    mode: 'onSubmit'
  });

  // Watch the additionalLanguage switch to show/hide select
  const watchAdditionalLanguage = watch('additionalLanguage');
  // Watch the flagNotifyIo switch to show/hide IO API Key field
  const watchFlagNotifyIo = watch('flagNotifyIo');

  const onSubmit = (values: UnifiedFormValues, enableOrg?: boolean) => {
    const step2Data = formValuesToFieldData(values, data);
    setData(step2Data);
    onNext(step2Data, enableOrg);
  };

  return (
    <form>
      <Grid item xs={12} sx={{ mt: 4 }}>
        <Box
          borderRadius={2}
          bgcolor={theme.palette.background.paper}
          padding={4}
        >
          <Typography
            variant="h4"
            fontWeight={600}
            color="textPrimary"
            sx={{ mb: 2 }}
          >
            {t('organizationEditWizard.step2.title')}
          </Typography>
          <Typography
            variant="body2"
            color="error.main"
            sx={{ marginBottom: 3 }}
          >
            {t('commons.requiredFieldDescription')}
          </Typography>

          {/* Accounting Information Section */}
          <AccountingInfoSection
            control={control}
            errors={errors}
            data={data}
            t={t}
            createIBANValidationRules={createIBANValidationRules}
          />
        </Box>
      </Grid>

      {/* Payments Section */}
      <Grid item xs={12} sx={{ mt: 4 }}>
        <Box
          borderRadius={2}
          bgcolor={theme.palette.background.paper}
          padding={4}
        >
          <PaymentsInfoSection
            control={control}
            errors={errors}
            data={data}
            t={t}
            watchAdditionalLanguage={watchAdditionalLanguage}
          />
        </Box>
      </Grid>

      {/* PagoPA Products Integration Section */}
      <Grid item xs={12} sx={{ mt: 4 }}>
        <Box
          borderRadius={2}
          bgcolor={theme.palette.background.paper}
          padding={4}
        >
          <PagoPAIntegrationSection
            control={control}
            errors={errors}
            data={data}
            t={t}
            watchFlagNotifyIo={watchFlagNotifyIo}
          />
        </Box>
      </Grid>

      {/* Buttons: when in draft, a user can save in draft or save&enable
          when in active can only edit */}
      <WizardStepButtons
        onBack={onBack}
        onNext={handleSubmit((step2Data) =>
          onSubmit(
            step2Data,
            data.organizationStatus === 'DRAFT' ? true : false
          )
        )}
        disableNext={false}
        nextLabel={
          data.organizationStatus === 'DRAFT'
            ? 'organizationEditWizard.enableOrg'
            : 'organizationEditWizard.saveChanges'
        }
        backLabel="commons.back"
        showSaveDraft={data.organizationStatus === 'DRAFT' ? true : false}
        onSaveDraft={handleSubmit((step2Data) => onSubmit(step2Data, false))}
      />
    </form>
  );
};

export default Step2EntityConfiguration;
