import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TuneIcon from '@mui/icons-material/Tune';
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  TypographyProps
} from '@mui/material';
import { ReactNode, useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate, useParams } from 'react-router';

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
import {
  OrganizationApiKey,
  PdndClientNoSecretDTO,
  PdndServiceView
} from '../../../generated/core/data-contracts';
import { SubUnitIntegrations } from './SubUnitIntegrations';
import { ApiKeyDialog } from './dialogs/ApiKeyDialog';

const I18N_PREFIX = { keyPrefix: 'organizations.integrations' };

const Field = ({
  label,
  width,
  variant = 'body2',
  children
}: {
  label: string;
  width?: string;
  variant?: TypographyProps['variant'];
  children: ReactNode;
}) => (
  <Stack sx={{ flex: width ? `0 0 ${width}` : '0 1 auto', minWidth: 0 }}>
    <Typography component="dt" variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Tooltip
      title={typeof children == 'string' ? children : ''}
      placement="top-start"
    >
      <Typography
        component="dd"
        variant={variant}
        fontWeight={variant === 'body2' ? 600 : undefined}
        noWrap
        sx={{ m: 0 }}
      >
        {children}
      </Typography>
    </Tooltip>
  </Stack>
);

const Row = ({
  name,
  onShow,
  children
}: {
  name: string;
  onShow: () => void;
  children: ReactNode;
}) => {
  const { t } = useTranslation(undefined, I18N_PREFIX);
  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" gap={10}>
        <Stack
          component="dl"
          direction="row"
          justifyContent="space-between"
          gap={2}
          sx={{ flex: 1, minWidth: 0, m: 0 }}
        >
          {children}
        </Stack>
        <Button
          variant="text"
          endIcon={<ArrowForwardIcon />}
          aria-label={t('showItem', { name })}
          onClick={onShow}
        >
          {t('show')}
        </Button>
      </Stack>
    </Paper>
  );
};

const Section = ({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) => {
  const headingId = useId();
  return (
    <Stack component="section" aria-labelledby={headingId} gap={2}>
      <Typography id={headingId} variant="h5" component="h2">
        {title}
      </Typography>
      {children}
    </Stack>
  );
};

export const ApiKeysSection = ({
  apiKeys
}: {
  apiKeys: Array<OrganizationApiKey>;
}) => {
  const { t } = useTranslation(undefined, I18N_PREFIX);
  const [selected, setSelected] = useState<OrganizationApiKey>();
  if (apiKeys.length === 0) return null;

  return (
    <Section title={t('pagoPaProducts')}>
      {apiKeys.map((apiKey) => {
        const name = t(`keyTypes.${apiKey.keyType}`);
        return (
          <Row
            key={apiKey.keyType}
            name={name}
            onShow={() => setSelected(apiKey)}
          >
            <Field label={t('name')} width={'50%'}>
              {name}
            </Field>
            {apiKey.flagActive !== undefined && (
              <Field label={t('ioNotifications')}>
                <Chip
                  size="small"
                  color={apiKey.flagActive ? 'primary' : 'default'}
                  sx={{ '& .MuiChip-label': { fontWeight: 600 } }}
                  label={t(apiKey.flagActive ? 'active' : 'inactive')}
                />
              </Field>
            )}
            <Field label={t('apiKey')}>
              <span role="img" aria-label={t('hiddenApiKey')}>
                {SECRET_MASK}
              </span>
            </Field>
          </Row>
        );
      })}
      {selected && (
        <ApiKeyDialog
          open
          apiKey={selected}
          onClose={() => setSelected(undefined)}
        />
      )}
    </Section>
  );
};

export const ServicesSection = ({
  services
}: {
  services: Array<PdndServiceView>;
}) => {
  const { t } = useTranslation(undefined, I18N_PREFIX);
  const [selected, setSelected] = useState<PdndServiceView>();
  if (services.length === 0) return null;

  return (
    <Section title={t('pdndServices')}>
      {services.map((service) => (
        <Row
          key={`${service.serviceType}-${service.purposeId}`}
          name={service.serviceName}
          onShow={() => setSelected(service)}
        >
          <Field label={t('name')} width={'25%'}>
            {service.serviceName}
          </Field>
          <Field label={t('purposeId')} variant="monospaced">
            {service.purposeId || '-'}
          </Field>
          <Field label={t('clientId')} variant="monospaced">
            {service.clientId}
          </Field>
        </Row>
      ))}
      {/* {selected && ( */}
      {/*   <PdndSendServiceDialog */}
      {/*     open */}
      {/*     service={selected} */}
      {/*     onClose={() => setSelected(undefined)} */}
      {/*   /> */}
      {/* )} */}
    </Section>
  );
};

export const ClientsSection = ({
  clients
}: {
  clients: Array<PdndClientNoSecretDTO>;
}) => {
  const { t } = useTranslation(undefined, I18N_PREFIX);
  const [selected, setSelected] = useState<PdndClientNoSecretDTO>();
  if (clients.length === 0) return null;

  return (
    <Section title={t('pdndClients')}>
      {clients.map((client) => (
        <Row
          key={client.clientId}
          name={client.clientName}
          onShow={() => setSelected(client)}
        >
          <Field label={t('name')} width={'25%'}>
            {client.clientName}
          </Field>
          <Field label={t('clientId')} variant="monospaced">
            {client.clientId}
          </Field>
        </Row>
      ))}
      {/* {selected && ( */}
      {/*   <PdndClientDialog */}
      {/*     open */}
      {/*     client={selected} */}
      {/*     onClose={() => setSelected(undefined)} */}
      {/*   /> */}
      {/* )} */}
    </Section>
  );
};

export const OrganizationIntegrations = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const organizationId = Number(useParams().organizationId);
  const [tab, setTab] = useState(0);

  const { data: organization } = getOrganizationDetail(organizationId);
  const { data: apiKeys = [] } = getOrganizationApiKeys(organizationId);
  const { data: services = [] } = getPdndServices(organizationId);
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

  // not wired yet
  const addIntegration = () => undefined;

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
                onClick: addIntegration
              }}
            />
          )}
          {tab === 0 && !isEmpty && (
            <Stack gap={5}>
              <ApiKeysSection apiKeys={apiKeys} />
              <ServicesSection services={services} />
              <ClientsSection clients={clients} />
            </Stack>
          )}
          {tab === 1 && <SubUnitIntegrations />}
        </Box>
      </Stack>
    </Stack>
  );
};
