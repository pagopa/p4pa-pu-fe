import {
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
  Typography,
  Divider
} from '@mui/material';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import {
  LANGUAGE_OPTIONS,
  OrganizationEditStep2Data,
  Step2FormValues
} from '../../../../../../models/OrganizationEditTypes';

type PaymentsInfoSectionProps = {
  control: Control<Step2FormValues>;
  errors: FieldErrors<Step2FormValues>;
  data: OrganizationEditStep2Data;
  t: (key: string) => string;
  watchAdditionalLanguage: boolean;
};

export const PaymentsInfoSection = ({
  control,
  errors,
  data,
  t,
  watchAdditionalLanguage
}: PaymentsInfoSectionProps) => {
  return (
    <>
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
                label={t('organizationEditWizard.step2.segregationCode.label')}
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
                <FormControl fullWidth>
                  <InputLabel id="selected-language-label">
                    {t('organizationEditWizard.step2.selectedLanguage.label')}
                    <Typography component="span" color="error.main">
                      {' '}
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
                    error={!!errors.selectedLanguage}
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
          <Controller
            name="flagNotifyOutcomePush"
            control={control}
            rules={{
              validate: (value) =>
                value !== null ||
                t('organizationEditWizard.step2.radioRequired')
            }}
            render={({ field, fieldState }) => (
              <>
                <RadioGroup
                  {...field}
                  sx={{ flexDirection: 'row' }}
                  value={field.value === null ? '' : field.value}
                  onChange={(e) => {
                    const value = e.target.value === 'true';
                    field.onChange(value);
                  }}
                  data-testid="flagNotifyOutcomePush-radio-group"
                >
                  <FormControlLabel
                    value={true}
                    control={<Radio data-testid="flagNotifyOutcomePush-true" />}
                    label={t(
                      'organizationEditWizard.step2.flagNotifyOutcomePush.abilita'
                    )}
                    disabled={data.flagNotifyOutcomePush.readonly}
                  />
                  <FormControlLabel
                    value={false}
                    control={<Radio data-testid="flagNotifyOutcomePush-false" />}
                    label={t(
                      'organizationEditWizard.step2.flagNotifyOutcomePush.disabilita'
                    )}
                    disabled={data.flagNotifyOutcomePush.readonly}
                  />
                </RadioGroup>
                {fieldState.error && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {fieldState.error.message}
                  </Typography>
                )}
              </>
            )}
          />
        </Grid>

        {/* Notifications of payments managed by Unitary Platform */}
        <Grid item xs={12} sx={{ mt: 3 }}>
          <Typography
            variant="body2"
            color="text.primary"
            sx={{ fontSize: 20, mb: 1 }}
          >
            {t('organizationEditWizard.step2.flagPaymentNotification.label')}
            <Typography component="span" color="error.main">
              *
            </Typography>
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {t(
              'organizationEditWizard.step2.flagPaymentNotification.description'
            )}
          </Typography>
          <Controller
            name="flagPaymentNotification"
            control={control}
            rules={{
              validate: (value) =>
                value !== null ||
                t('organizationEditWizard.step2.radioRequired')
            }}
            render={({ field, fieldState }) => (
              <>
                <RadioGroup
                  {...field}
                  sx={{ flexDirection: 'row' }}
                  value={field.value === null ? '' : field.value}
                  onChange={(e) => {
                    const value = e.target.value === 'true';
                    field.onChange(value);
                  }}
                  data-testid="flagPaymentNotification-radio-group"
                >
                  <FormControlLabel
                    value={true}
                    control={
                      <Radio data-testid="flagPaymentNotification-true" />
                    }
                    label={t(
                      'organizationEditWizard.step2.flagPaymentNotification.abilita'
                    )}
                    disabled={data.flagPaymentNotification.readonly}
                  />
                  <FormControlLabel
                    value={false}
                    control={
                      <Radio data-testid="flagPaymentNotification-false" />
                    }
                    label={t(
                      'organizationEditWizard.step2.flagPaymentNotification.disabilita'
                    )}
                    disabled={data.flagPaymentNotification.readonly}
                  />
                </RadioGroup>
                {fieldState.error && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {fieldState.error.message}
                  </Typography>
                )}
              </>
            )}
          />
        </Grid>
      </Grid>
    </>
  );
};
