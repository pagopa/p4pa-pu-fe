import { FormControlLabel, Grid, Switch, TextField, Typography } from '@mui/material';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import {
  OrganizationEditStep2Data,
  Step2FormValues
} from '../../../../../../models/OrganizationEditTypes';

type AccountingInfoSectionProps = {
  control: Control<Step2FormValues>;
  errors: FieldErrors<Step2FormValues>;
  data: OrganizationEditStep2Data;
  t: (key: string) => string;
  createIBANValidationRules: (t: (key: string) => string, isRequired?: boolean) => any;
};

export const AccountingInfoSection = ({
  control,
  errors,
  data,
  t,
  createIBANValidationRules
}: AccountingInfoSectionProps) => {
  return (
    <>
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
            rules={createIBANValidationRules(t, true)}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('organizationEditWizard.step2.iban.label')}
                placeholder={t('organizationEditWizard.step2.iban.placeholder')}
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
            rules={createIBANValidationRules(t, false)}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('organizationEditWizard.step2.ibanContabile.label')}
                placeholder={t('organizationEditWizard.step2.ibanContabile.placeholder')}
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
                placeholder={t('organizationEditWizard.step2.cbill.placeholder')}
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
                label={t('organizationEditWizard.step2.integratedCashJournal.label')}
                sx={{ mt: 1 }}
              />
            )}
          />
        </Grid>
      </Grid>
    </>
  );
};
