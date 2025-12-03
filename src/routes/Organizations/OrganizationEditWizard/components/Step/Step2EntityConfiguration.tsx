import { Grid, Typography, Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import WizardStepButtons from '../../../../../components/Wizard/WizardStepButtons';
import {
  UnifiedFormData,
  UnifiedFormValues,
  FieldData
} from '../../../../../models/OrganizationEditTypes';
import { theme } from '@pagopa/mui-italia';
import { AccountingInfoSection } from './sections/AccountingInfoSection';
import { PaymentsInfoSection } from './sections/PaymentsInfoSection';
import { PagoPAIntegrationSection } from './sections/PagoPAIntegrationSection';
import { createIBANValidationRules } from '../../../../../utils/validationRules';

type Props = {
  data: UnifiedFormData;
  setData: (data: UnifiedFormData) => void;
  onNext: (data?: UnifiedFormData, enableOrg?: boolean) => void;
  onBack: () => void;
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

const formValuesToFieldData = (
  values: UnifiedFormValues,
  originalData: UnifiedFormData
): UnifiedFormData => {
  return {
    // Step 1 fields - preserve original values
    orgName: originalData.orgName,
    orgFiscalCode: originalData.orgFiscalCode,
    orgEmail: originalData.orgEmail,
    orgLogo: originalData.orgLogo,
    logoRemoved: originalData.logoRemoved,
    // Step 2 Accounting Information
    iban: createFieldData(values.iban, originalData.iban),
    ibanPostal: createFieldData(values.ibanPostal, originalData.ibanPostal),
    cbill: createFieldData(values.cbill, originalData.cbill),
    flagTreasury: createFieldData(
      values.flagTreasury,
      originalData.flagTreasury
    ),
    // Step 2 Payments Information
    segregationCode: createFieldData(
      values.segregationCode,
      originalData.segregationCode
    ),
    generateNoticeApiKey: createFieldData(
      values.generateNoticeApiKey,
      originalData.generateNoticeApiKey
    ),
    additionalLanguage: createFieldData(
      values.additionalLanguage,
      originalData.additionalLanguage
    ),
    selectedLanguage: createFieldData(
      values.selectedLanguage,
      originalData.selectedLanguage
    ),
    flagNotifyOutcomePush: createFieldData(
      values.flagNotifyOutcomePush,
      originalData.flagNotifyOutcomePush
    ),
    flagPaymentNotification: createFieldData(
      values.flagPaymentNotification,
      originalData.flagPaymentNotification
    ),
    // Step 2 PagoPA Products Integration
    flagNotifyIo: createFieldData(
      values.flagNotifyIo,
      originalData.flagNotifyIo
    ),
    ioApiKey: createFieldData(values.ioApiKey, originalData.ioApiKey),
    pdndEnabled: createFieldData(values.pdndEnabled, originalData.pdndEnabled),
    sendApiKey: createFieldData(values.sendApiKey, originalData.sendApiKey),
    organizationStatus: originalData.organizationStatus
  };
};

const Step2EntityConfiguration = ({ data, setData, onNext, onBack }: Props) => {
  const { t } = useTranslation();

  // Calculate initial values dynamically to sync with parent data changes
  const getInitialValues = (): UnifiedFormValues => {
    return {
      // Step 1 fields
      orgName: data.orgName.value || '',
      orgFiscalCode: data.orgFiscalCode.value || '',
      orgEmail: data.orgEmail.value || '',
      orgLogo: null, // Logo is handled separately
      // Step 2 Accounting Information
      iban: data.iban.value || '',
      ibanPostal: data.ibanPostal.value || '',
      cbill: data.cbill.value || '',
      flagTreasury: data.flagTreasury.value,
      // Step 2 Payments Information
      segregationCode: data.segregationCode.value || '',
      generateNoticeApiKey: data.generateNoticeApiKey.value || '',
      additionalLanguage: data.additionalLanguage.value,
      selectedLanguage: data.selectedLanguage.value || '',
      // Preserve null values for required radio groups
      flagNotifyOutcomePush: data.flagNotifyOutcomePush.value,
      flagPaymentNotification: data.flagPaymentNotification.value,
      // Step 2 PagoPA Products Integration
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
