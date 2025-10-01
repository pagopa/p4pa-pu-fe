import { Grid, Typography, Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import WizardStepButtons from '../../../../../components/Wizard/WizardStepButtons';
import {
  OrganizationEditStep2Data,
  Step2FormValues,
  FieldData
} from '../../../../../models/OrganizationEditTypes';
import { isValidIBAN } from '../../../../../utils/fieldValidation';
import { theme } from '@pagopa/mui-italia';
import { AccountingInfoSection } from './sections/AccountingInfoSection';
import { PaymentsInfoSection } from './sections/PaymentsInfoSection';
import { PagoPAIntegrationSection } from './sections/PagoPAIntegrationSection';

type Props = {
  data: OrganizationEditStep2Data;
  setData: (data: OrganizationEditStep2Data) => void;
  onNext: (data?: OrganizationEditStep2Data) => void;
  onBack: () => void;
};

// Validation rules factory for IBAN fields
const createIBANValidationRules = (t: (key: string) => string, isRequired = false) => {
  const rules: any = {
    validate: {
      validIBAN: (value: string) => {
        if (!value) return true;
        return isValidIBAN(value) || t('organizationEditWizard.step2.iban.invalid');
      }
    }
  };

  if (isRequired) {
    rules.required = {
      value: true,
      message: t('organizationEditWizard.step2.iban.required')
    };
  }

  return rules;
};

// Utility function to create FieldData from form value and original field
const createFieldData = function <T>(
  formValue: T,
  originalField: FieldData<T>
): FieldData<T> {
  return {
    value: formValue,
    readonly: originalField.readonly
  };
};

// Utility function to convert form values to Step2Data format
const formValuesToFieldData = (
  values: Step2FormValues,
  originalData: OrganizationEditStep2Data
): OrganizationEditStep2Data => {
  return {
    iban: createFieldData(values.iban, originalData.iban),
    ibanContabile: createFieldData(values.ibanContabile, originalData.ibanContabile),
    cbill: createFieldData(values.cbill, originalData.cbill),
    flagTreasury: createFieldData(values.flagTreasury, originalData.flagTreasury),
    segregationCode: createFieldData(values.segregationCode, originalData.segregationCode),
    generateNoticeApiKey: createFieldData(values.generateNoticeApiKey, originalData.generateNoticeApiKey),
    additionalLanguage: createFieldData(values.additionalLanguage, originalData.additionalLanguage),
    selectedLanguage: createFieldData(values.selectedLanguage, originalData.selectedLanguage),
    flagNotifyOutcomePush: createFieldData(values.flagNotifyOutcomePush, originalData.flagNotifyOutcomePush),
    flagPaymentNotification: createFieldData(values.flagPaymentNotification, originalData.flagPaymentNotification),
    flagNotifyIo: createFieldData(values.flagNotifyIo, originalData.flagNotifyIo),
    ioApiKey: createFieldData(values.ioApiKey, originalData.ioApiKey),
    pdndEnabled: createFieldData(values.pdndEnabled, originalData.pdndEnabled),
    sendApiKey: createFieldData(values.sendApiKey, originalData.sendApiKey)
  };
};

const Step2EntityConfiguration = ({ data, setData, onNext, onBack }: Props) => {
  const { t } = useTranslation();

  // Calculate initial values dynamically to sync with parent data changes
  const getInitialValues = (): Step2FormValues => {
    return {
      // Accounting Information
      iban: data.iban.value || '',
      ibanContabile: data.ibanContabile.value || '',
      cbill: data.cbill.value || '',
      flagTreasury: data.flagTreasury.value,
      // Payments Information
      segregationCode: data.segregationCode.value || '',
      generateNoticeApiKey: data.generateNoticeApiKey.value || '',
      additionalLanguage: data.additionalLanguage.value,
      selectedLanguage: data.selectedLanguage.value || '',
      // Convert null to false for radio groups
      flagNotifyOutcomePush: data.flagNotifyOutcomePush.value ?? false,
      flagPaymentNotification: data.flagPaymentNotification.value ?? false,
      // PagoPA Products Integration
      flagNotifyIo: data.flagNotifyIo.value,
      ioApiKey: data.ioApiKey.value || '',
      pdndEnabled: data.pdndEnabled.value,
      sendApiKey: data.sendApiKey.value || ''
    };
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch
  } = useForm<Step2FormValues>({
    defaultValues: getInitialValues(),
    values: getInitialValues(), // This ensures form updates when data changes
    mode: 'onSubmit'
  });

  // Watch the additionalLanguage switch to show/hide select
  const watchAdditionalLanguage = watch('additionalLanguage');
  // Watch the flagNotifyIo switch to show/hide IO API Key field
  const watchFlagNotifyIo = watch('flagNotifyIo');

  const onSubmit = (values: Step2FormValues) => {
    const step2Data = formValuesToFieldData(values, data);
    setData(step2Data);
    onNext(step2Data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
            sx={{ fontWeight: 600, marginBottom: 3 }}
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

      <WizardStepButtons
        onBack={onBack}
        onNext={handleSubmit(onSubmit)}
        disableNext={false}
        nextLabel="organizationEditWizard.saveChanges"
        backLabel="commons.back"
      />
    </form>
  );
};

export default Step2EntityConfiguration;
