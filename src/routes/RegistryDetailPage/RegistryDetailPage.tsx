import React from 'react';
import { useParams } from 'react-router';
import { Box, Typography, Alert, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DetailContainer from '../../components/DetailContainer/DetailContainer';
import { useRegistry } from '../../api/registryDetail';
import { mapRegistryToDetailSections } from './registryDetailConfig';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import { RegistryType } from '../Events/configs';

export const RegistryDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { registryId, registryType } = useParams<{
    registryId: string;
    registryType: RegistryType;
  }>();

  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const {
    data: registry,
    isLoading,
    error
  } = useRegistry(
    registryType as RegistryType,
    organizationId,
    registryId || '',
    !!(organizationId && registryId && registryType)
  );

  if (!registryType || !['pagopa', 'sil'].includes(registryType)) {
    return (
      <Box sx={{ padding: 2, maxWidth: '1200px', margin: '0 auto' }}>
        <Alert severity="error">
          {t('registry.detail.invalidRegistryTypeError')}
        </Alert>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 2, maxWidth: '1200px', margin: '0 auto' }}>
        <Alert severity="error">{t('registry.detail.loadError')}</Alert>
      </Box>
    );
  }

  if (!registry && !isLoading) {
    return (
      <Box sx={{ padding: 2, maxWidth: '1200px', margin: '0 auto' }}>
        <Alert severity="warning">{t('registry.detail.notFound')}</Alert>
      </Box>
    );
  }

  const sections = registry ? mapRegistryToDetailSections(registry, t) : null;

  const renderContent = () => {
    if (!sections) {
      return null;
    }

    return (
      <Grid container spacing={3}>
        <Grid item md={6}>
          <DetailContainer
            sections={[sections[0]]}
            data-testid="event-container"
          />
        </Grid>
        <Grid item md={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <DetailContainer
                sections={[sections[1]]}
                data-testid="detail-container"
              />
            </Grid>
            <Grid item xs={12}>
              <DetailContainer
                sections={[sections[2]]}
                data-testid="specific-parameters-container"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ padding: 2, maxWidth: '1200px', margin: '0 auto' }}>
      <Box mb={3}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          data-testid="detail-title"
        >
          {t('registry.detail.eventDetailTitle')}
        </Typography>
      </Box>

      {renderContent()}
    </Box>
  );
};
