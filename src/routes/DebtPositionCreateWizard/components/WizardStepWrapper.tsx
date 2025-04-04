// routes/DebtPositionWizard/components/WizardStepWrapper.tsx
import { Box, Grid, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { PropsWithChildren } from 'react';

type Props = {
  title: string;
  subtitle: string;
};

const WizardStepWrapper = ({
  title,
  subtitle,
  children
}: PropsWithChildren<Props>) => {
  return (
    <Box
      bgcolor={theme.palette.common.white}
      borderRadius={0.5}
      p={3}
      gap={3}
      width="100%"
    >
      <Grid item lg={12} mb={2}>
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {subtitle}
        </Typography>
      </Grid>
      {children}
    </Box>
  );
};

export default WizardStepWrapper;
