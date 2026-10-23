import { theme } from '@pagopa/mui-italia';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

type Props = BoxProps & {
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
  children,
  ...rest
}: PropsWithChildren<Props>) => {
  const { t } = useTranslation();

  return (
    <Box
      bgcolor={theme.palette.common.white}
      borderRadius={1}
      p={3}
      gap={3}
      width="100%"
      {...rest}
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
