import {
  Grid,
  TextField,
  Typography,
  Box,
  FormControlLabel,
  Switch,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  InputLabel,
  Divider
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import WizardStepButtons from '../../../../../components/Wizard/WizardStepButtons';
import {
  OrganizationEditStep2Data,
  LANGUAGE_OPTIONS
} from '../../../../../models/OrganizationEditTypes';
import { isValidIBAN } from '../../../../../utils/fieldValidation';
import { theme } from '@pagopa/mui-italia';

type Props = {
  data: OrganizationEditStep2Data;
  setData: (data: OrganizationEditStep2Data) => void;
  onNext: () => void;
  onBack: () => void;
};

type Step2FormValues = {
  // Accounting Information
  iban: string;
  ibanContabile: string;
  cbill: string;
  integratedCashJournal: boolean;
  // Payments Information
  segregationCode: string;
  generateNoticeApiKey: string;
  additionalLanguage: boolean;
  selectedLanguage: string;
  flagNotifyOutcomePush: boolean | null;
  flagPaymentNotification: boolean | null;
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
      integratedCashJournal: data.integratedCashJournal.value,
      // Payments Information
      segregationCode: data.segregationCode.value,
      generateNoticeApiKey: data.generateNoticeApiKey.value,
      additionalLanguage: data.additionalLanguage.value,
      selectedLanguage: data.selectedLanguage.value,
      flagNotifyOutcomePush: data.flagNotifyOutcomePush.value,
      flagPaymentNotification: data.flagPaymentNotification.value
    },
    mode: 'onSubmit'
  });

  // Watch the additionalLanguage switch to show/hide select
  const watchAdditionalLanguage = watch('additionalLanguage');

  // Prepopulate the fields when the API data arrives
  useEffect(() => {
    // Accounting Information
    if (data.iban.value) {
      setValue('iban', data.iban.value);
    }
    if (data.ibanContabile.value) {
      setValue('ibanContabile', data.ibanContabile.value);
    }
    if (data.cbill.value) {
      setValue('cbill', data.cbill.value);
    }
    setValue('integratedCashJournal', data.integratedCashJournal.value);

    // Payments Information
    if (data.segregationCode.value) {
      setValue('segregationCode', data.segregationCode.value);
    }
    if (data.generateNoticeApiKey.value) {
      setValue('generateNoticeApiKey', data.generateNoticeApiKey.value);
    }
    setValue('additionalLanguage', data.additionalLanguage.value);
    setValue('selectedLanguage', data.selectedLanguage.value);
    setValue('flagNotifyOutcomePush', data.flagNotifyOutcomePush.value);
    setValue('flagPaymentNotification', data.flagPaymentNotification.value);
  }, [
    data.iban.value,
    data.ibanContabile.value,
    data.cbill.value,
    data.integratedCashJournal.value,
    data.segregationCode.value,
    data.generateNoticeApiKey.value,
    data.additionalLanguage.value,
    data.selectedLanguage.value,
    data.flagNotifyOutcomePush.value,
    data.flagPaymentNotification.value,
    setValue
  ]);

  const onSubmit = (values: Step2FormValues) => {
    setData({
      // Accounting Information
      iban: {
        value: values.iban,
        readonly: data.iban.readonly
      },
      ibanContabile: {
        value: values.ibanContabile,
        readonly: data.ibanContabile.readonly
      },
      cbill: {
        value: values.cbill,
        readonly: data.cbill.readonly
      },
      integratedCashJournal: {
        value: values.integratedCashJournal,
        readonly: data.integratedCashJournal.readonly
      },
      // Payments Information
      segregationCode: {
        value: values.segregationCode,
        readonly: data.segregationCode.readonly
      },
      generateNoticeApiKey: {
        value: values.generateNoticeApiKey,
        readonly: data.generateNoticeApiKey.readonly
      },
      additionalLanguage: {
        value: values.additionalLanguage,
        readonly: data.additionalLanguage.readonly
      },
      selectedLanguage: {
        value: values.selectedLanguage,
        readonly: data.selectedLanguage.readonly
      },
      flagNotifyOutcomePush: {
        value: values.flagNotifyOutcomePush,
        readonly: data.flagNotifyOutcomePush.readonly
      },
      flagPaymentNotification: {
        value: values.flagPaymentNotification,
        readonly: data.flagPaymentNotification.readonly
      }
    });

    onNext();
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
                name="integratedCashJournal"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        {...field}
                        checked={field.value}
                        disabled={data.integratedCashJournal.readonly}
                        data-testid="integrated-cash-journal-switch"
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
                        <MenuItem value={LANGUAGE_OPTIONS.IT}>
                          {t(
                            'organizationEditWizard.step2.selectedLanguage.options.it'
                          )}
                        </MenuItem>
                        <MenuItem value={LANGUAGE_OPTIONS.EN}>
                          {t(
                            'organizationEditWizard.step2.selectedLanguage.options.en'
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
              <Controller
                name="flagNotifyOutcomePush"
                control={control}
                render={({ field }) => (
                  <FormControl>
                    <FormLabel component="legend">
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{ fontWeight: 600 }}
                      >
                        {t(
                          'organizationEditWizard.step2.flagNotifyOutcomePush.label'
                        )}
                        <Typography component="span" color="error.main">
                          *
                        </Typography>
                      </Typography>
                    </FormLabel>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 2 }}
                    >
                      {t(
                        'organizationEditWizard.step2.flagNotifyOutcomePush.description'
                      )}
                    </Typography>
                    <RadioGroup
                      {...field}
                      value={field.value === null ? '' : field.value.toString()}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ''
                            ? null
                            : e.target.value === 'true'
                        )
                      }
                      row
                    >
                      <FormControlLabel
                        value="true"
                        control={<Radio />}
                        label={t(
                          'organizationEditWizard.step2.flagNotifyOutcomePush.abilita'
                        )}
                        disabled={data.flagNotifyOutcomePush.readonly}
                      />
                      <FormControlLabel
                        value="false"
                        control={<Radio />}
                        label={t(
                          'organizationEditWizard.step2.flagNotifyOutcomePush.disabilita'
                        )}
                        disabled={data.flagNotifyOutcomePush.readonly}
                      />
                    </RadioGroup>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Notifications of payments managed by Unitary Platform */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Controller
                name="flagPaymentNotification"
                control={control}
                render={({ field }) => (
                  <FormControl>
                    <FormLabel component="legend">
                      <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                        {t(
                          'organizationEditWizard.step2.flagPaymentNotification.label'
                        )}
                        <Typography component="span" color="error.main">
                          *
                        </Typography>
                      </Typography>
                    </FormLabel>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 2 }}
                    >
                      {t(
                        'organizationEditWizard.step2.flagPaymentNotification.description'
                      )}
                    </Typography>
                    <RadioGroup
                      {...field}
                      value={field.value === null ? '' : field.value.toString()}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ''
                            ? null
                            : e.target.value === 'true'
                        )
                      }
                      row
                    >
                      <FormControlLabel
                        value="true"
                        control={<Radio />}
                        label={t(
                          'organizationEditWizard.step2.flagPaymentNotification.abilita'
                        )}
                        disabled={data.flagPaymentNotification.readonly}
                      />
                      <FormControlLabel
                        value="false"
                        control={<Radio />}
                        label={t(
                          'organizationEditWizard.step2.flagPaymentNotification.disabilita'
                        )}
                        disabled={data.flagPaymentNotification.readonly}
                      />
                    </RadioGroup>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </Grid>

      <WizardStepButtons
        onBack={onBack}
        onNext={handleSubmit(onSubmit)}
        disableNext={false}
        nextLabel="commons.continue"
        backLabel="commons.back"
      />
    </form>
  );
};

export default Step2ConfigurazioneEnte;
