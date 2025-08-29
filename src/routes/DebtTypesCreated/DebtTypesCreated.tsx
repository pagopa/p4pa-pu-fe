import { Add } from '@mui/icons-material';
import { Box, Tab, Tabs } from '@mui/material';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { PageRoutes } from '../../routes';
import ManagedOrgs from './ManagedOrgs/ManagedOrgs';
import MyOrg from './MyOrg/MyOrg';
import utils from '../../utils';
import { useStore } from '../../store/GlobalStore';

export const DebtTypesCreated = () => {
  const isSuperAdmin = utils.roles.useIsSuperAdmin();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { organizationId: organizationIdByURL } = useParams<{
    organizationId: string;
  }>();
  const {
    state: { organizations }
  } = useStore();

  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    const tabValue = parseInt(tabParam || '0');
    return isNaN(tabValue) ? 0 : Math.max(0, Math.min(1, tabValue));
  };

  const [tabValue, setTabValue] = useState(getInitialTab);

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    const urlTab = parseInt(currentTab || '0');
    const validTab = isNaN(urlTab) ? 0 : Math.max(0, Math.min(1, urlTab));

    if (validTab !== tabValue) {
      setTabValue(validTab);
    }
  }, [searchParams.get('tab')]);

  // Initialize tab parameter in URL if missing
  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab === null) {
      const params = new URLSearchParams(searchParams);
      params.set('tab', '0');
      setSearchParams(params, { replace: true });
    }
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);

    // Update URL preserving other parameters but resetting pagination
    const params = new URLSearchParams(searchParams);
    params.set('tab', newValue.toString());

    // Reset pagination when changing tab to avoid confusion
    params.delete('page');
    params.delete('size');

    setSearchParams(params, { replace: true });
  };

  const renderTabs = () => {
    return (
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            width: '100%'
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(event, newValue) => {
              handleTabChange(event, newValue);
            }}
            aria-label="debt types tabs"
            centered
            variant="fullWidth"
          >
            <Tab label={t('debtTypesCreated.tabMyOrganization')} />
            <Tab label={t('debtTypesCreated.tabManagedOrganizations')} />
          </Tabs>
        </Box>
      </Box>
    );
  };

  const callToActionEl = [
    {
      icon: <Add />,
      buttonText: t('debtTypesCreated.callToAction'),
      onActionClick: () => navigate(PageRoutes.DEBT_TYPE_ORG_CREATE)
    }
  ];

  const descriptionByUrl = t('debtTypesCreated.descriptionByURL');

  const org = organizations.find(
    (o) => o.organizationId === Number(organizationIdByURL)
  );

  const titleByUrl = org ? org.orgName : undefined;

  const descriptionFullOrNot = `debtTypesCreated.description${isSuperAdmin ? 'Full' : ''}`;
  const description = !organizationIdByURL
    ? descriptionFullOrNot
    : descriptionByUrl;

  return (
    <>
      <TitleComponent
        title={titleByUrl ?? t('commons.routes.DEBT_TYPES_DASHBOARD')}
        callToAction={!organizationIdByURL ? callToActionEl : []}
        description={t(description)}
      />

      {isSuperAdmin && !organizationIdByURL ? renderTabs() : null}

      <Box>
        {tabValue === 0 ? (
          <MyOrg key={`myorg-tab-${tabValue}`} />
        ) : (
          <ManagedOrgs key={`managedorgs-tab-${tabValue}`} />
        )}
      </Box>
    </>
  );
};

export default DebtTypesCreated;
