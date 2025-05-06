import { Add, Search } from '@mui/icons-material';
import { Box, Tab, Tabs, Grid } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
  const [tabValue, setTabValue] = useState(0);

  const [codeFilter, setCodeFilter] = useState('');
  const [descriptionFilter, setDescriptionFilter] = useState('');

  const [IPACodeFilter, setIPACodeFilter] = useState('');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const isMyOrgFilterActive = () =>
    codeFilter !== '' || descriptionFilter !== '';

  const isManagedOrgsFilterActive = () => IPACodeFilter !== '';

  const handleSearch = () => {
    if (tabValue === 0) {
      console.log('code:', codeFilter, 'description:', descriptionFilter);
    } else {
      console.log('IPA Code:', IPACodeFilter);
    }
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
              disabled: !isMyOrgFilterActive(),
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
              label: t('commons.searchForIPACode'),
              value: IPACodeFilter,
              adornment: <Search />,
              onChange: (e) => setIPACodeFilter(e.target.value),
              gridWidth: 10.5
            },
            {
              type: COMPONENT_TYPE.button,
              label: t('commons.search'),
              onClick: handleSearch,
              disabled: !isManagedOrgsFilterActive(),
              gridWidth: 1.5
            }
          ]}
        />
      );
    }
  };

  const renderTabs = () => (
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
          onChange={handleTabChange}
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

  return (
    <>
      <TitleComponent
        title={t('commons.routes.DEBT_TYPES_CREATED')}
        callToAction={[
          {
            icon: <Add />,
            buttonText: t('debtTypesCreated.callToAction'),
            onActionClick: () => navigate(PageRoutes.DEBT_TYPE_CREATE)
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
            codeFilter={codeFilter}
            descriptionFilter={descriptionFilter}
          />
        ) : (
          <ManagedOrgs IPACodeFilter={IPACodeFilter} />
        )}
      </Box>
    </>
  );
};

export default DebtTypesCreated;
