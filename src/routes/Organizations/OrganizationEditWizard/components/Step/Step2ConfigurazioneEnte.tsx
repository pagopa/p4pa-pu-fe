import {
  Grid,
  TextField,
  Typography,
  Box,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Divider,
  FormControl
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import WizardStepButtons from '../../../../../components/Wizard/WizardStepButtons';
import { FormComponent } from '../../../../../components/FormComponent';
import {
  OrganizationEditStep2Data,
  LANGUAGE_OPTIONS,
  FieldData
} from '../../../../../models/OrganizationEditTypes';
import { isValidIBAN } from '../../../../../utils/fieldValidation';
import { theme } from '@pagopa/mui-italia';
import Appio from '../../../../../assets/appio.svg';
import Send from '../../../../../assets/send.svg';

type Props = {
  data: OrganizationEditStep2Data;
  setData: (data: OrganizationEditStep2Data) => void;
  onNext: (data?: OrganizationEditStep2Data) => void;
  onBack: () => void;
};

type Step2FormValues = {
  // Accounting Information
  iban: string;
  ibanContabile: string;
  cbill: string;
  flagTreasury: boolean;
  // Payments Information
  segregationCode: string;
  generateNoticeApiKey: string;
  additionalLanguage: boolean;
  selectedLanguage: string;
  flagNotifyOutcomePush: boolean;
  flagPaymentNotification: boolean;
  // PagoPA Products Integration
  flagNotifyIo: boolean;
  ioApiKey: string;
  pdndEnabled: boolean;
  sendApiKey: string;
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

// Utility function to populate form fields from Step2 data
const populateFormFields = (
  data: OrganizationEditStep2Data,
  setValue: (name: keyof Step2FormValues, value: any) => void
) => {
  // Accounting Information
  if (data.iban.value) setValue('iban', data.iban.value);
  if (data.ibanContabile.value)
    setValue('ibanContabile', data.ibanContabile.value);
  if (data.cbill.value) setValue('cbill', data.cbill.value);
  setValue('flagTreasury', data.flagTreasury.value);

  // Payments Information
  if (data.segregationCode.value)
    setValue('segregationCode', data.segregationCode.value);
  if (data.generateNoticeApiKey.value)
    setValue('generateNoticeApiKey', data.generateNoticeApiKey.value);
  setValue('additionalLanguage', data.additionalLanguage.value);
  setValue('selectedLanguage', data.selectedLanguage.value);
  // Convert null to false for radio groups
  setValue('flagNotifyOutcomePush', data.flagNotifyOutcomePush.value ?? false);
  setValue(
    'flagPaymentNotification',
    data.flagPaymentNotification.value ?? false
  );

  // PagoPA Products Integration
  if (data.flagNotifyIo) setValue('flagNotifyIo', data.flagNotifyIo.value);
  if (data.ioApiKey?.value) setValue('ioApiKey', data.ioApiKey.value);
  if (data.pdndEnabled) setValue('pdndEnabled', data.pdndEnabled.value);
  if (data.sendApiKey?.value) setValue('sendApiKey', data.sendApiKey.value);
};

const Step2ConfigurazioneEnte = ({ data, setData, onNext, onBack }: Props) => {
  const { t } = useTranslation();

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch
  } = useForm<Step2FormValues>({
    defaultValues: {
      // Accounting Information
      iban: data.iban.value,
      ibanContabile: data.ibanContabile.value,
      cbill: data.cbill.value,
      flagTreasury: data.flagTreasury.value,
      // Payments Information
      segregationCode: data.segregationCode.value,
      generateNoticeApiKey: data.generateNoticeApiKey.value,
      additionalLanguage: data.additionalLanguage.value,
      selectedLanguage: data.selectedLanguage.value,
      // Convert null to false for radio groups
      flagNotifyOutcomePush: data.flagNotifyOutcomePush.value ?? false,
      flagPaymentNotification: data.flagPaymentNotification.value ?? false,
      // PagoPA Products Integration
      flagNotifyIo: data.flagNotifyIo.value,
      ioApiKey: data.ioApiKey.value,
      pdndEnabled: data.pdndEnabled.value,
      sendApiKey: data.sendApiKey.value
    },
    mode: 'onSubmit'
  });

  // Watch the additionalLanguage switch to show/hide select
  const watchAdditionalLanguage = watch('additionalLanguage');
  // Watch the flagNotifyIo switch to show/hide IO API Key field
  const watchFlagNotifyIo = watch('flagNotifyIo');

  // Prepopulate the fields when the API data arrives
  useEffect(() => {
    populateFormFields(data, setValue);
  }, [
    data.iban.value,
    data.ibanContabile.value,
    data.cbill.value,
    data.flagTreasury.value,
    data.segregationCode.value,
    data.generateNoticeApiKey.value,
    data.additionalLanguage.value,
    data.selectedLanguage.value,
    data.flagNotifyOutcomePush.value,
    data.flagPaymentNotification.value,
    data.flagNotifyIo.value,
    data.ioApiKey.value,
    data.pdndEnabled.value,
    data.sendApiKey.value,
    setValue
  ]);

  const onSubmit = (values: Step2FormValues) => {
    const step2Data = {
      // Accounting Information
      iban: createFieldData(values.iban, data.iban),
      ibanContabile: createFieldData(values.ibanContabile, data.ibanContabile),
      cbill: createFieldData(values.cbill, data.cbill),
      flagTreasury: createFieldData(
        values.flagTreasury,
        data.flagTreasury
      ),
      // Payments Information
      segregationCode: createFieldData(
        values.segregationCode,
        data.segregationCode
      ),
      generateNoticeApiKey: createFieldData(
        values.generateNoticeApiKey,
        data.generateNoticeApiKey
      ),
      additionalLanguage: createFieldData(
        values.additionalLanguage,
        data.additionalLanguage
      ),
      selectedLanguage: createFieldData(
        values.selectedLanguage,
        data.selectedLanguage
      ),
      // Convert boolean back to boolean | null (keeping boolean for now as API expects it)
      flagNotifyOutcomePush: createFieldData(
        values.flagNotifyOutcomePush,
        data.flagNotifyOutcomePush
      ),
      flagPaymentNotification: createFieldData(
        values.flagPaymentNotification,
        data.flagPaymentNotification
      ),
      // PagoPA Products Integration
      flagNotifyIo: createFieldData(values.flagNotifyIo, data.flagNotifyIo),
      ioApiKey: createFieldData(values.ioApiKey, data.ioApiKey),
      pdndEnabled: createFieldData(values.pdndEnabled, data.pdndEnabled),
      sendApiKey: createFieldData(values.sendApiKey, data.sendApiKey)
    };

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
          <Typography
            variant="body2"
            fontWeight={800}
            color="textPrimary"
            sx={{ mb: 3, mt: 3 }}
          >
            {t('organizationEditWizard.step2.accountingInfo.title')}
          </Typography>

          <Grid container spacing={2}>
            {/* IBAN Field - Required */}
            <Grid item xs={12}>
              <Controller
                name="iban"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: t('organizationEditWizard.step2.iban.required')
                  },
                  validate: {
                    validIBAN: (value: string) => {
                      if (!value) return true;
                      return (
                        isValidIBAN(value) ||
                        t('organizationEditWizard.step2.iban.invalid')
                      );
                    }
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('organizationEditWizard.step2.iban.label')}
                    placeholder={t(
                      'organizationEditWizard.step2.iban.placeholder'
                    )}
                    disabled={data.iban.readonly}
                    error={!!errors.iban}
                    helperText={errors.iban?.message}
                    data-testid="iban-field"
                    required
                  />
                )}
              />
            </Grid>

            {/* IBAN Contabile Field */}
            <Grid item xs={12}>
              <Controller
                name="ibanContabile"
                control={control}
                rules={{
                  validate: {
                    validIBAN: (value: string) => {
                      if (!value) return true;
                      return (
                        isValidIBAN(value) ||
                        t('organizationEditWizard.step2.ibanContabile.invalid')
                      );
                    }
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t(
                      'organizationEditWizard.step2.ibanContabile.label'
                    )}
                    placeholder={t(
                      'organizationEditWizard.step2.ibanContabile.placeholder'
                    )}
                    disabled={data.ibanContabile.readonly}
                    error={!!errors.ibanContabile}
                    helperText={errors.ibanContabile?.message}
                    data-testid="iban-contabile-field"
                  />
                )}
              />
            </Grid>

            {/* CBILL Field */}
            <Grid item xs={12}>
              <Controller
                name="cbill"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('organizationEditWizard.step2.cbill.label')}
                    placeholder={t(
                      'organizationEditWizard.step2.cbill.placeholder'
                    )}
                    disabled={data.cbill.readonly}
                    error={!!errors.cbill}
                    helperText={errors.cbill?.message}
                    data-testid="cbill-field"
                  />
                )}
              />
            </Grid>

            {/* Integrated Cash Journal Toggle */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Controller
                name="flagTreasury"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        {...field}
                        checked={field.value}
                        disabled={data.flagTreasury.readonly}
                        data-testid="flag-treasury-switch"
                      />
                    }
                    label={t(
                      'organizationEditWizard.step2.integratedCashJournal.label'
                    )}
                    sx={{ mt: 1 }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </Grid>

      {/* Payments Section */}
      <Grid item xs={12} sx={{ mt: 4 }}>
        <Box
          borderRadius={2}
          bgcolor={theme.palette.background.paper}
          padding={4}
        >
          <Typography
            variant="body2"
            fontWeight={800}
            color="textPrimary"
            sx={{ mb: 3, mt: 3 }}
          >
            {t('organizationEditWizard.step2.paymentsInfo.title')}
          </Typography>

          <Grid container spacing={2}>
            {/* Codice Segregazione Field - Required */}
            <Grid item xs={12}>
              <Controller
                name="segregationCode"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: t(
                      'organizationEditWizard.step2.segregationCode.required'
                    )
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t(
                      'organizationEditWizard.step2.segregationCode.label'
                    )}
                    placeholder={t(
                      'organizationEditWizard.step2.segregationCode.placeholder'
                    )}
                    disabled={data.segregationCode.readonly}
                    error={!!errors.segregationCode}
                    helperText={errors.segregationCode?.message}
                    data-testid="segregation-code-field"
                    required
                  />
                )}
              />
            </Grid>

            {/* API Key stampa avvisi Field - Required */}
            <Grid item xs={12}>
              <Controller
                name="generateNoticeApiKey"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: t(
                      'organizationEditWizard.step2.generateNoticeApiKey.required'
                    )
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t(
                      'organizationEditWizard.step2.generateNoticeApiKey.label'
                    )}
                    placeholder={t(
                      'organizationEditWizard.step2.generateNoticeApiKey.placeholder'
                    )}
                    disabled={data.generateNoticeApiKey.readonly}
                    error={!!errors.generateNoticeApiKey}
                    helperText={errors.generateNoticeApiKey?.message}
                    data-testid="generate-notice-api-key-field"
                    required
                  />
                )}
              />
            </Grid>

            {/* The alerts have an additional language Toggle */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Controller
                name="additionalLanguage"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        {...field}
                        checked={field.value}
                        disabled={data.additionalLanguage.readonly}
                        data-testid="additional-language-switch"
                      />
                    }
                    label={t(
                      'organizationEditWizard.step2.additionalLanguage.label'
                    )}
                    sx={{ mt: 1 }}
                  />
                )}
              />
            </Grid>

            {/* Conditional Language Select */}
            {watchAdditionalLanguage && (
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Controller
                  name="selectedLanguage"
                  control={control}
                  rules={{
                    required: {
                      value: watchAdditionalLanguage,
                      message: t(
                        'organizationEditWizard.step2.selectedLanguage.required'
                      )
                    }
                  }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.selectedLanguage}>
                      <InputLabel id="selected-language-label">
                        {t(
                          'organizationEditWizard.step2.selectedLanguage.label'
                        )}
                        <Typography component="span" color="error.main">
                          *
                        </Typography>
                      </InputLabel>
                      <Select
                        {...field}
                        labelId="selected-language-label"
                        label={t(
                          'organizationEditWizard.step2.selectedLanguage.label'
                        )}
                        disabled={data.selectedLanguage.readonly}
                        displayEmpty
                        data-testid="selected-language-select"
                      >
                        <MenuItem value={LANGUAGE_OPTIONS.EN}>
                          {t(
                            'organizationEditWizard.step2.selectedLanguage.options.en'
                          )}
                        </MenuItem>
                        <MenuItem value={LANGUAGE_OPTIONS.FR}>
                          {t(
                            'organizationEditWizard.step2.selectedLanguage.options.fr'
                          )}
                        </MenuItem>
                        <MenuItem value={LANGUAGE_OPTIONS.DE}>
                          {t(
                            'organizationEditWizard.step2.selectedLanguage.options.de'
                          )}
                        </MenuItem>
                      </Select>
                      {errors.selectedLanguage && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 0.5 }}
                        >
                          {errors.selectedLanguage.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            )}

            {/* Divider after language select when visible */}
            {watchAdditionalLanguage && (
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Divider />
              </Grid>
            )}

            {/* Notifications of payments managed by external platforms */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography
                variant="body2"
                color="text.primary"
                sx={{ fontSize: 20, mb: 1 }}
              >
                {t('organizationEditWizard.step2.flagNotifyOutcomePush.label')}
                <Typography component="span" color="error.main">
                  *
                </Typography>
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {t(
                  'organizationEditWizard.step2.flagNotifyOutcomePush.description'
                )}
              </Typography>
              <FormComponent.ControlledRadioGroup
                name="flagNotifyOutcomePush"
                control={control}
                disabled={data.flagNotifyOutcomePush.readonly}
                sx={{ flexDirection: 'row' }}
                options={[
                  {
                    value: true,
                    label: t(
                      'organizationEditWizard.step2.flagNotifyOutcomePush.abilita'
                    )
                  },
                  {
                    value: false,
                    label: t(
                      'organizationEditWizard.step2.flagNotifyOutcomePush.disabilita'
                    )
                  }
                ]}
              />
            </Grid>

            {/* Notifications of payments managed by Unitary Platform */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography
                variant="body2"
                color="text.primary"
                sx={{ fontSize: 20, mb: 1 }}
              >
                {t(
                  'organizationEditWizard.step2.flagPaymentNotification.label'
                )}
                <Typography component="span" color="error.main">
                  *
                </Typography>
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {t(
                  'organizationEditWizard.step2.flagPaymentNotification.description'
                )}
              </Typography>
              <FormComponent.ControlledRadioGroup
                name="flagPaymentNotification"
                control={control}
                disabled={data.flagPaymentNotification.readonly}
                sx={{ flexDirection: 'row' }}
                options={[
                  {
                    value: true,
                    label: t(
                      'organizationEditWizard.step2.flagPaymentNotification.abilita'
                    )
                  },
                  {
                    value: false,
                    label: t(
                      'organizationEditWizard.step2.flagPaymentNotification.disabilita'
                    )
                  }
                ]}
              />
            </Grid>
          </Grid>
        </Box>
      </Grid>

      {/* PagoPA Products Integration Section */}
      <Grid item xs={12} sx={{ mt: 4 }}>
        <Box
          borderRadius={2}
          bgcolor={theme.palette.background.paper}
          padding={4}
        >
          <Typography
            variant="body2"
            fontWeight={800}
            color="textPrimary"
            sx={{ mb: 3, mt: 3 }}
          >
            {t('organizationEditWizard.step2.pagoPaIntegration.title')}
          </Typography>

          <Grid container spacing={3}>
            {/* IO Section */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  mb: 2
                }}
              >
                <Box sx={{ width: 40 }} aria-hidden="true">
                  <Appio />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                    IO
                  </Typography>
                  <Controller
                    name="flagNotifyIo"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            {...field}
                            checked={field.value}
                            disabled={data.flagNotifyIo.readonly}
                            data-testid="flag-notify-io-switch"
                          />
                        }
                        label={t(
                          'organizationEditWizard.step2.pagoPaIntegration.io.label'
                        )}
                      />
                    )}
                  />
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mt: 1 }}
                  >
                    {t(
                      'organizationEditWizard.step2.pagoPaIntegration.io.description'
                    )}
                  </Typography>

                  {/* IO API Key Field - Conditional */}
                  {watchFlagNotifyIo && (
                    <Box sx={{ mt: 2 }}>
                      <Controller
                        name="ioApiKey"
                        control={control}
                        rules={{
                          required: {
                            value: watchFlagNotifyIo,
                            message: t(
                              'organizationEditWizard.step2.pagoPaIntegration.io.apiKeyRequired'
                            )
                          }
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label={t(
                              'organizationEditWizard.step2.pagoPaIntegration.io.apiKeyLabel'
                            )}
                            placeholder={t(
                              'organizationEditWizard.step2.pagoPaIntegration.io.apiKeyPlaceholder'
                            )}
                            disabled={data.ioApiKey.readonly}
                            error={!!errors.ioApiKey}
                            helperText={
                              errors.ioApiKey?.message ||
                              t(
                                'organizationEditWizard.step2.pagoPaIntegration.io.apiKeyHelperText'
                              )
                            }
                            data-testid="io-api-key-field"
                            required
                          />
                        )}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* SEND Section */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  mb: 2
                }}
              >
                <Box sx={{ width: 40 }} aria-hidden="true">
                  <Send />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                    SEND
                  </Typography>
                  <Controller
                    name="pdndEnabled"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            {...field}
                            checked={field.value}
                            disabled={data.pdndEnabled.readonly}
                            data-testid="pdnd-enabled-switch"
                          />
                        }
                        label={t(
                          'organizationEditWizard.step2.pagoPaIntegration.send.label'
                        )}
                      />
                    )}
                  />
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mt: 1 }}
                  >
                    {t(
                      'organizationEditWizard.step2.pagoPaIntegration.send.description'
                    )}
                  </Typography>

                  {/* SEND API Key Field - Always visible */}
                  <Box sx={{ mt: 2 }}>
                    <Controller
                      name="sendApiKey"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label={t(
                            'organizationEditWizard.step2.pagoPaIntegration.send.apiKeyLabel'
                          )}
                          placeholder={t(
                            'organizationEditWizard.step2.pagoPaIntegration.send.apiKeyPlaceholder'
                          )}
                          disabled={data.sendApiKey.readonly}
                          error={!!errors.sendApiKey}
                          helperText={errors.sendApiKey?.message}
                          data-testid="send-api-key-field"
                        />
                      )}
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
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

export default Step2ConfigurazioneEnte;
