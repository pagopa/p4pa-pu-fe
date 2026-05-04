import { Box, Tab, Tabs } from '@mui/material';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import MyOrganization from './MyOrganization/MyOrganization';
import AllOrganizations from './AllOrganizations/AllOrganizations';
import utils from '../../utils';
import { useStore } from '../../store/GlobalStore';

export const OperatorsList = () => {
  const isSuperAdmin = utils.roles.useIsSuperAdmin();
  const { t } = useTranslation();
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
            aria-label="operators tabs"
            centered
            variant="fullWidth"
          >
            <Tab label={t('operatorsList.tabMyOrganization')} />
            <Tab label={t('operatorsList.tabAllOrganizations')} />
          </Tabs>
        </Box>
      </Box>
    );
  };

  const org = organizations.find(
    (o) => o.organizationId === Number(organizationIdByURL)
  );

  const titleByUrl = org ? org.orgName : undefined;

  const descriptionFullOrNot = `operatorsList.description${isSuperAdmin ? 'Full' : ''}`;
  const description = !organizationIdByURL
    ? descriptionFullOrNot
    : 'operatorsList.description';

  const getAccessibleTitle = () => {
    if (organizationIdByURL && titleByUrl) {
      return t('operatorsList.accessibleTitle', { orgName: titleByUrl });
    }
    return t('commons.routes.OPERATORS_LIST');
  };

  return (
    <>
      <TitleComponent
        title={titleByUrl ?? t('commons.routes.OPERATORS_LIST')}
        callToAction={[]}
        description={t(description)}
        accessibleTitle={getAccessibleTitle()}
      />

      {isSuperAdmin && !organizationIdByURL ? renderTabs() : null}

      <Box>
        {tabValue === 0 ? (
          <MyOrganization key={`myorg-tab-${tabValue}`} omitOrgName={true} />
        ) : (
          <AllOrganizations key={`allorgs-tab-${tabValue}`} />
        )}
      </Box>
    </>
  );
};

export default OperatorsList;
