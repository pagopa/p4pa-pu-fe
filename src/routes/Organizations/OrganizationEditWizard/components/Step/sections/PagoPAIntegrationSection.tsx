import {
  Box,
  Divider,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import {
  OrganizationEditStep2Data,
  Step2FormValues
} from '../../../../../../models/OrganizationEditTypes';
import Appio from '../../../../../../assets/appio.svg';
import Send from '../../../../../../assets/send.svg';

type PagoPAIntegrationSectionProps = {
  control: Control<Step2FormValues>;
  errors: FieldErrors<Step2FormValues>;
  data: OrganizationEditStep2Data;
  t: (key: string) => string;
  watchFlagNotifyIo: boolean;
};

export const PagoPAIntegrationSection = ({
  control,
  errors,
  data,
  t,
  watchFlagNotifyIo
}: PagoPAIntegrationSectionProps) => {
  return (
    <>
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
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
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
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
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
    </>
  );
};
