import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TuneIcon from '@mui/icons-material/Tune';
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useParams } from 'react-router';

import { PageRoutes } from '..';
import {
  getOrganizationApiKeys,
  getOrganizationDetail,
  getPdndClients,
  getPdndServices
} from '../../api/organizations';
import EmptyDataGrid from '../../components/EmptyDataGrid/EmptyDataGrid';
import { SECRET_MASK } from '../../components/ShowSecretValue';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { setCustomBreadcrumbsItems } from '../../store/AppStateStore';
import { OrganizationApiKeyType } from '../../../generated/core/data-contracts';

type Field = {
  label: string;
  value: React.ReactNode;
  gridWidth: number;
  mono?: boolean;
};
type Item = { key: string; name: string; fields: Array<Field> };

const IntegrationCard = ({
  name,
  fields
}: {
  name: string;
  fields: Array<Field>;
}) => {
  const { t } = useTranslation();
  return (
    <Paper
      elevation={0}
      sx={{ px: 3.75, py: 3, display: 'flex', alignItems: 'center', gap: 2 }}
    >
      <Grid container spacing={2} alignItems="center">
        {fields.map(({ label, value, gridWidth, mono }) => (
          <Grid item xs={gridWidth} key={label} minWidth={0}>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography
              variant="body2"
              component="div"
              fontWeight={mono ? 400 : 600}
              fontFamily={mono ? 'monospace' : undefined}
              noWrap
              // full value on hover when truncated with ellipsis
              title={typeof value === 'string' ? value : undefined}
            >
              {value}
            </Typography>
          </Grid>
        ))}
      </Grid>
      <Button
        variant="text"
        endIcon={<ArrowForwardIcon />}
        aria-label={t('organizations.integrations.showItem', { name })}
      >
        {t('organizations.integrations.show')}
      </Button>
    </Paper>
  );
};

const Section = ({ title, items }: { title: string; items: Array<Item> }) =>
  items.length > 0 && (
    <Stack gap={2} component="section">
      <Typography variant="h5" component="h2">
        {title}
      </Typography>
      {items.map(({ key, name, fields }) => (
        <IntegrationCard key={key} name={name} fields={fields} />
      ))}
    </Stack>
  );

export const OrganizationIntegrations = () => {
  const { t } = useTranslation();
  const organizationId = Number(useParams().organizationId);
  const [tab, setTab] = useState(0);

  const { data: organization } = getOrganizationDetail(organizationId);
  const { data: apiKeys = [] } = getOrganizationApiKeys(organizationId);
  const { data: services = [] } = getPdndServices(organizationId);
  const { data: clients = [] } = getPdndClients(organizationId);

  useEffect(() => {
    if (!organization) return;
    setCustomBreadcrumbsItems([
      { pathname: PageRoutes.ORGANIZATIONS_INDEX, id: 'ORGANIZATIONS' },
      {
        pathname: generatePath(PageRoutes.ORGANIZATIONS_DETAIL, {
          organizationId
        }),
        label: organization.orgName,
        id: 'ORGANIZATIONS_DETAIL'
      },
      { pathname: '', id: 'ORGANIZATIONS_INTEGRATIONS' }
    ]);
  }, [organization, organizationId]);

  const nameLabel = t('organizations.integrations.name');
  const clientIdLabel = t('organizations.integrations.clientId');

  const productItems: Array<Item> = apiKeys.map(({ keyType }) => {
    const name = t(`organizations.integrations.keyTypes.${keyType}`);
    const isIO = keyType === OrganizationApiKeyType.IO;
    return {
      key: keyType,
      name,
      fields: [
        // without the IO notifications column the name takes its space
        { label: nameLabel, value: name, gridWidth: isIO ? 5 : 8 },
        ...(isIO
          ? [
              {
                label: t('organizations.integrations.ioNotifications'),
                gridWidth: 3,
                value: (
                  <Chip
                    size="small"
                    color={organization?.flagNotifyIo ? 'primary' : 'default'}
                    sx={{ '& .MuiChip-label': { fontWeight: 600 } }}
                    label={
                      organization?.flagNotifyIo
                        ? t('organizations.integrations.active')
                        : t('organizations.integrations.inactive')
                    }
                  />
                )
              }
            ]
          : []),
        {
          label: t('organizations.integrations.apiKey'),
          gridWidth: 4,
          value: (
            <span
              role="img"
              aria-label={t('organizations.integrations.hiddenApiKey')}
            >
              {SECRET_MASK}
            </span>
          )
        }
      ]
    };
  });

  const serviceItems: Array<Item> = services.map((s) => ({
    key: `${s.serviceType}-${s.purposeId}`,
    name: s.serviceName,
    fields: [
      { label: nameLabel, value: s.serviceName, gridWidth: 3 },
      {
        label: t('organizations.integrations.purposeId'),
        value: s.purposeId || '-',
        gridWidth: 4,
        mono: true
      },
      { label: clientIdLabel, value: s.clientId, gridWidth: 5, mono: true }
    ]
  }));

  const clientItems: Array<Item> = clients.map((c) => ({
    key: c.clientId,
    name: c.clientName,
    fields: [
      { label: nameLabel, value: c.clientName, gridWidth: 7 },
      { label: clientIdLabel, value: c.clientId, gridWidth: 5, mono: true }
    ]
  }));

  const isEmpty =
    productItems.length + serviceItems.length + clientItems.length === 0;

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
            // not wired yet
            onActionClick: () => undefined
          }
        ]}
      />

      <Stack gap={3} mt={1}>
        <Tabs
          value={tab}
          onChange={(_, value: number) => setTab(value)}
          variant="fullWidth"
          aria-label={t('organizations.manageIntegrations')}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label={organization?.orgName ?? ''}
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
              // not wired yet
              action={{
                label: t('organizations.integrations.add'),
                onClick: () => undefined
              }}
            />
          )}
          {tab === 0 && !isEmpty && (
            <Stack gap={5}>
              <Section
                title={t('organizations.integrations.pagoPaProducts')}
                items={productItems}
              />
              <Section
                title={t('organizations.integrations.pdndServices')}
                items={serviceItems}
              />
              <Section
                title={t('organizations.integrations.pdndClients')}
                items={clientItems}
              />
            </Stack>
          )}
        </Box>
      </Stack>
    </Stack>
  );
};
