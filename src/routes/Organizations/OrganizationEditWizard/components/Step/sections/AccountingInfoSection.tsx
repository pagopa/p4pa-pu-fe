import {
  Box,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { theme } from '@pagopa/mui-italia';
import {
  UnifiedFormData,
  UnifiedFormValues
} from '../../../../../../models/OrganizationEditTypes';

type AccountingInfoSectionProps = {
  control: Control<UnifiedFormValues>;
  errors: FieldErrors<UnifiedFormValues>;
  data: UnifiedFormData;
  t: (key: string) => string;
  createIBANValidationRules: (
    t: (key: string) => string,
    isRequired?: boolean
  ) => Record<string, unknown>;
};

export const AccountingInfoSection = ({
  control,
  errors,
  data,
  t,
  createIBANValidationRules
}: AccountingInfoSectionProps) => {
  return (
    <Box
      border={1}
      borderRadius={2}
      borderColor={theme.palette.divider}
      bgcolor={theme.palette.background.paper}
      padding={3}
      sx={{ mb: 3, mt: 3 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <AccountBalanceIcon sx={{ color: 'text.primary' }} fontSize="small" />
        <Typography variant="body2" fontWeight={800} color="textPrimary">
          {t('organizationEditWizard.step2.accountingInfo.title')}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            name="iban"
            control={control}
            rules={createIBANValidationRules(
              t,
              data.organizationStatus === 'ACTIVE'
            )}
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
                required={data.organizationStatus === 'ACTIVE'}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="ibanPostal"
            control={control}
            rules={createIBANValidationRules(t, false)}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('organizationEditWizard.step2.ibanPostal.label')}
                placeholder={t(
                  'organizationEditWizard.step2.ibanPostal.placeholder'
                )}
                disabled={data.ibanPostal.readonly}
                error={!!errors.ibanPostal}
                helperText={errors.ibanPostal?.message}
                data-testid="iban-postal-field"
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
  );
};
