import { Add, Search } from '@mui/icons-material';
import { Box, Tab, Tabs, Grid } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { PageRoutes } from '../../App';
import FilterContainer, {
  COMPONENT_TYPE
} from '../../components/FilterContainer/FilterContainer';
import ManagedOrgs from './ManagedOrgs/ManagedOrgs';
import MyOrg from './MyOrg/MyOrg';
import utils from '../../utils';

export const DebtTypesCreated = () => {
  const isSuperAdmin = utils.roles.useIsSuperAdmin();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    const tabValue = parseInt(tabParam || '0');
    return isNaN(tabValue) ? 0 : Math.max(0, Math.min(1, tabValue));
  };

  const [tabValue, setTabValue] = useState(getInitialTab);
  const [codeFilter, setCodeFilter] = useState('');
  const [descriptionFilter, setDescriptionFilter] = useState('');
  const [IPACodeFilter, setIPACodeFilter] = useState('');

  const myOrgSearchRef = useRef<(() => void) | null>(null);
  const managedOrgsSearchRef = useRef<(() => void) | null>(null);

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

  const handleSearch = () => {
    if (tabValue === 0 && myOrgSearchRef.current) {
      myOrgSearchRef.current();
    } else if (tabValue === 1 && managedOrgsSearchRef.current) {
      managedOrgsSearchRef.current();
    }
  };

  const registerMyOrgSearch = (searchFn: () => void) => {
    myOrgSearchRef.current = searchFn;
  };

  const registerManagedOrgsSearch = (searchFn: () => void) => {
    managedOrgsSearchRef.current = searchFn;
  };

  const renderFilters = () => {
    if (tabValue === 0) {
      return (
        <FilterContainer
          items={[
            {
              type: COMPONENT_TYPE.textField,
              label: t('commons.searchForCode'),
              value: codeFilter,
              adornment: <Search />,
              onChange: (e) => setCodeFilter(e.target.value),
              gridWidth: 5
            },
            {
              type: COMPONENT_TYPE.textField,
              label: t('commons.searchForDescription'),
              value: descriptionFilter,
              adornment: <Search />,
              onChange: (e) => setDescriptionFilter(e.target.value),
              gridWidth: 5
            },
            {
              type: COMPONENT_TYPE.button,
              label: t('commons.search'),
              onClick: handleSearch,
              gridWidth: 2
            }
          ]}
        />
      );
    } else {
      return (
        <FilterContainer
          items={[
            {
              type: COMPONENT_TYPE.textField,
              label: t('commons.searchForOrganizationName'),
              value: IPACodeFilter,
              adornment: <Search />,
              onChange: (e) => setIPACodeFilter(e.target.value),
              gridWidth: 10.5
            },
            {
              type: COMPONENT_TYPE.button,
              label: t('commons.search'),
              onClick: handleSearch,
              gridWidth: 1.5
            }
          ]}
        />
      );
    }
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

  return (
    <>
      <TitleComponent
        title={t('commons.routes.DEBT_TYPES_DASHBOARD')}
        callToAction={[
          {
            icon: <Add />,
            buttonText: t('debtTypesCreated.callToAction'),
            onActionClick: () => navigate(PageRoutes.DEBT_TYPE_ORG_CREATE)
          }
        ]}
        description={t(
          `debtTypesCreated.description${isSuperAdmin ? 'Full' : ''}`
        )}
      />

      <Grid
        container
        direction="row"
        alignItems={'center'}
        justifyContent={'space-between'}
        sx={{ mt: 6, mb: 4 }}
      >
        {renderFilters()}
      </Grid>

      {isSuperAdmin ? renderTabs() : null}

      <Box>
        {tabValue === 0 ? (
          <MyOrg
            key={`myorg-tab-${tabValue}`}
            codeFilter={codeFilter}
            descriptionFilter={descriptionFilter}
            onSearch={registerMyOrgSearch}
          />
        ) : (
          <ManagedOrgs
            key={`managedorgs-tab-${tabValue}`}
            IPACodeFilter={IPACodeFilter}
            onSearch={registerManagedOrgsSearch}
          />
        )}
      </Box>
    </>
  );
};

export default DebtTypesCreated;
