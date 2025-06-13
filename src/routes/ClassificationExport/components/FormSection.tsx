import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { theme } from '@pagopa/mui-italia';

type FormSectionProps = {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
};

export const FormSection: React.FC<FormSectionProps> = ({
  icon,
  title,
  children
}) => (
  <Grid
    border={1}
    borderRadius={2}
    padding={3}
    borderColor={theme.palette.divider}
    bgcolor={theme.palette.common.white}
    mb={2}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      {icon}
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
    </Box>
    {children}
  </Grid>
);
