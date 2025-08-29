import { Box, Grid, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  title?: string;
  subtitle?: string;
  alertMessage?: string;
  showRequiredFieldsMessage?: boolean;
};

const WizardStepWrapper = ({
  title,
  subtitle,
  alertMessage,
  showRequiredFieldsMessage = false,
  children
}: PropsWithChildren<Props>) => {
  const { t } = useTranslation();

  return (
    <Box
      bgcolor={theme.palette.common.white}
      borderRadius={1}
      p={3}
      gap={3}
      width="100%"
    >
      <Grid item lg={12} mb={2}>
        {title && (
          <Typography variant="h4" gutterBottom>
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography variant="body1" gutterBottom>
            {subtitle}
          </Typography>
        )}
        {alertMessage && (
          <Typography variant="body1" color="error" sx={{ marginBottom: 2 }}>
            {alertMessage}
          </Typography>
        )}
        {showRequiredFieldsMessage && (
          <Typography
            variant="body2"
            color="error.main"
            sx={{ fontWeight: 400, marginBottom: 1, marginTop: 2 }}
          >
            {t('commons.requiredFieldDescription')}
          </Typography>
        )}
      </Grid>
      {children}
    </Box>
  );
};

export default WizardStepWrapper;
