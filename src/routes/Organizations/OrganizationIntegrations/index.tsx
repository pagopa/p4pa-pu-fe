import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import { Box, Stack, Tab, Tabs } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate, useParams } from 'react-router';

import { PageRoutes } from '../..';
import { getOrganizationDetail } from '../../../api/organizations';
import EmptyDataGrid from '../../../components/EmptyDataGrid/EmptyDataGrid';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import { setCustomBreadcrumbsItems } from '../../../store/AppStateStore';
import { ApiKeysSection } from './components/Sections/ApiKeysSection';
import { ClientsSection } from './components/Sections/ClientsSection';
import { ServicesSection } from './components/Sections/ServiceSection';
import { SubUnitIntegrations } from './components/Sections/SubUnitIntegrations';

import {
  getOrganizationApiKeys,
  getPdndClients,
  getPdndServices
} from '@core/api/integrations';
import { useHashParamsListener } from '@core/hooks/useHashParamsListener';
import utils from '@core/utils';

export const I18N_PREFIX = { keyPrefix: 'organizations.integrations' };

export const OrganizationIntegrations = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const organizationId = Number(useParams().organizationId);

  const tab = Number(useHashParamsListener<Record<string, unknown>>().tab) || 0;
  const setTab = (tab: number) => utils.URI.set(`tab=${tab}`);

  const { data: organization } = getOrganizationDetail(organizationId);

  const { data: apiKeys = [], ...organizationApiKeys } =
    getOrganizationApiKeys(organizationId);

  const { data: services = [], ...pdndServices } =
    getPdndServices(organizationId);

  const { data: clients = [] } = getPdndClients(organizationId);

  const isEmpty = apiKeys.length + services.length + clients.length === 0;

  const orgName = organization?.orgName;

  useEffect(() => {
    if (!orgName) return;
    setCustomBreadcrumbsItems([
      { pathname: PageRoutes.ORGANIZATIONS_INDEX, id: 'ORGANIZATIONS' },
      {
        pathname: generatePath(PageRoutes.ORGANIZATIONS_DETAIL, {
          organizationId
        }),
        label: orgName,
        id: 'ORGANIZATIONS_DETAIL'
      },
      { pathname: '', id: 'ORGANIZATIONS_INTEGRATIONS' }
    ]);
  }, [orgName, organizationId]);

  const addIntegrationAction = () => {
    navigate(generatePath(PageRoutes.ADD_INTEGRATION, { organizationId }));
  };

  return (
    <Stack pb={5}>
      <TitleComponent
        title={t('organizations.manageIntegrations')}
        description={t('organizations.integrations.description')}
        callToAction={[
          {
            buttonText: t('organizations.integrations.add'),
            icon: <AddIcon />,
            dataTestId: 'add-integration-button',
            onActionClick: addIntegrationAction
          }
        ]}
      />

      <Stack gap={3} mt={3}>
        <Tabs
          value={tab}
          onChange={(_, value: number) => setTab(value)}
          variant="fullWidth"
          aria-label={t('organizations.manageIntegrations')}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label={orgName ?? ''}
            id="integrations-tab-0"
            aria-controls="integrations-tabpanel-0"
          />
          <Tab
            label={t('organizations.management.subUnits')}
            id="integrations-tab-1"
            aria-controls="integrations-tabpanel-1"
          />
        </Tabs>

        <Box
          role="tabpanel"
          id={`integrations-tabpanel-${tab}`}
          aria-labelledby={`integrations-tab-${tab}`}
        >
          {tab === 0 && isEmpty && (
            <EmptyDataGrid
              icon={<TuneIcon color="primary" fontSize="large" />}
              title={t('organizations.integrations.emptyTitle')}
              description={t('organizations.integrations.emptyDescription')}
              action={{
                label: t('organizations.integrations.add'),
                onClick: addIntegrationAction
              }}
            />
          )}
          {tab === 0 && !isEmpty && (
            <Stack gap={5}>
              <ApiKeysSection
                apiKeys={apiKeys}
                organizationId={organizationId}
                onDelete={organizationApiKeys.refetch}
              />
              <ServicesSection
                services={services}
                organizationId={organizationId}
                onDelete={pdndServices.refetch}
              />
              <ClientsSection clients={clients} />
            </Stack>
          )}
          {tab === 1 && <SubUnitIntegrations />}
        </Box>
      </Stack>
    </Stack>
  );
};
