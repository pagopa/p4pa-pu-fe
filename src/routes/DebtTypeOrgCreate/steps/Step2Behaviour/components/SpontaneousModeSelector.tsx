import { Controller, Control, FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import { FormComponent } from '../../../../../components/FormComponent';
import { DebtTypeOrgForm, SpontaneousMode } from '../../../types';

type SpontaneousModeSelectorProps = {
  control: Control<DebtTypeOrgForm>;
  errors: FieldErrors<DebtTypeOrgForm>;
  spontaneousMode?: SpontaneousMode;
  flagPresetAmount?: boolean;
};

export const SpontaneousModeSelector = ({
  control,
  errors,
  spontaneousMode,
  flagPresetAmount
}: SpontaneousModeSelectorProps) => {
  const { t } = useTranslation();

  return (
    <Stack gap={1} sx={{ mt: 1 }}>
      {flagPresetAmount && (
        <Alert
          severity="info"
          variant="outlined"
          data-testid="preset-amount-info"
          sx={{
            mb: 3
          }}
        >
          {t('debtTypeOrgCreate.behaviour.presetAmount.info')}
        </Alert>
      )}
      <FormComponent.ControlledSelect
        control={control}
        name="spontaneousMode"
        data-testid="spontaneousMode"
        label={t('debtTypeOrgCreate.behaviour.spontaneousMode.label')}
        required
        options={[
          {
            value: SpontaneousMode.STANDARD,
            label: t(
              'debtTypeOrgCreate.behaviour.spontaneousMode.options.standard'
            )
          },
          {
            value: SpontaneousMode.CUSTOM_FORM,
            label: t(
              'debtTypeOrgCreate.behaviour.spontaneousMode.options.custom'
            )
          },
          {
            value: SpontaneousMode.EXTERNAL_URL,
            label: t(
              'debtTypeOrgCreate.behaviour.spontaneousMode.options.external'
            )
          }
        ]}
      />
      <Typography variant="caption" color="text.secondary">
        {t('debtTypeOrgCreate.behaviour.spontaneousMode.helper')}
      </Typography>
      {spontaneousMode === SpontaneousMode.EXTERNAL_URL && (
        <Controller
          control={control}
          name="externalPaymentUrl"
          render={({ field }) => (
            <TextField
              {...field}
              label={t(
                'debtTypeOrgCreate.behaviour.spontaneous.externalUrl.label'
              )}
              required
              fullWidth
              margin="normal"
              placeholder="https://"
              size="small"
              inputProps={{ 'data-testid': 'externalPaymentUrl' }}
              error={!!errors.externalPaymentUrl}
              helperText={
                errors.externalPaymentUrl?.message
                  ? t(errors.externalPaymentUrl.message as string)
                  : undefined
              }
            />
          )}
        />
      )}
    </Stack>
  );
};
