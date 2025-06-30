import React from 'react';
import { useParams } from 'react-router';
import { Box, Typography, Alert, CircularProgress, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DetailContainer from '../../components/DetailContainer/DetailContainer';
import { useRegistry } from '../../api/registryDetail';
import { mapRegistryToDetailSections } from './registryDetailConfig';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';

export const RegistryDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { registryId, registryType } = useParams<{
    registryId: string;
    registryType: 'pagopa' | 'sil';
  }>();

  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const {
    data: registry,
    isLoading,
    error
  } = useRegistry(
    registryType as 'pagopa' | 'sil',
    organizationId,
    registryId || '',
    !!(organizationId && registryId && registryType)
  );

  if (!organizationId) {
    return (
      <Box m={2}>
        <Alert severity="error">
          {t('registry.detail.noOrganizationError')}
        </Alert>
      </Box>
    );
  }

  if (!registryType || !['pagopa', 'sil'].includes(registryType)) {
    return (
      <Box m={2}>
        <Alert severity="error">
          {t('registry.detail.invalidRegistryTypeError')}
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (!registry) {
    return (
      <Box m={2}>
        <Alert severity="error">
          {error?.message || t('registry.detail.loadError')}
        </Alert>
      </Box>
    );
  }

  const sections = mapRegistryToDetailSections(registry, t);

  return (
    <Box sx={{ padding: 2, maxWidth: '1200px', margin: '0 auto' }}>
      <Box mb={3}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          data-testId="detail-title"
        >
          {t('registry.detail.eventDetailTitle')}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item md={6}>
          <DetailContainer
            sections={[sections[0]]}
            data-testId="event-container"
          />
        </Grid>
        <Grid item md={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <DetailContainer
                sections={[sections[1]]}
                data-testId="detail-container"
              />
            </Grid>

            <Grid item xs={12}>
              <DetailContainer
                sections={[sections[2]]}
                data-testId="specific-parameters-container"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
