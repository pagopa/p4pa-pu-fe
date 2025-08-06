import { useState, useMemo, useEffect } from 'react';
import { Add } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import FilterContainer from '../../components/FilterContainer/FilterContainer';
import { ServiceTabs } from './components/ServiceTab';
import { ServiceDataGrid } from './components/ServiceDataGrid';
import { useStore } from '../../store/GlobalStore';
import { useSearch } from '../../hooks/useSearch';
import useOrgSilServiceFilters from '../../hooks/useOrgSilServiceFilters';
import orgSilServiceApi from '../../api/orgSilService';
import { OrgSilServicesFilters } from '../../api/orgSilService/mappings';
import {
  OrgSilServiceType,
  OrgSilServiceView,
  PagedOrgSilServiceView
} from '../../../generated/apiClient';
import { useNavigate } from 'react-router';
import { PageRoutes } from '..';

const SERVICE_CONFIGS: Record<
  number,
  { type: OrgSilServiceType; labelKey: string }
> = {
  0: {
    type: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
    labelKey: 'orgSilService.paymentNotice'
  },
  1: {
    type: OrgSilServiceType.ACTUALIZATION,
    labelKey: 'orgSilService.amountActualization'
  }
};

export const OrgSilServicesPage = () => {
  const { t } = useTranslation();
  const {
    state: { organizationId }
  } = useStore();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [filterValues, setFilterValues] = useState({
    notifications: '',
    actualization: ''
  });

  const notificationsQuery = orgSilServiceApi.getOrgSilServices({
    organizationId: Number(organizationId)
  });
  const notificationsSearch = useSearch<
    OrgSilServicesFilters,
    PagedOrgSilServiceView
  >({
    filters: {
      serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
      applicationName: filterValues.notifications
    },
    query: notificationsQuery
  });

  const actualizationQuery = orgSilServiceApi.getOrgSilServices({
    organizationId: Number(organizationId)
  });
  const actualizationSearch = useSearch<
    OrgSilServicesFilters,
    PagedOrgSilServiceView
  >({
    filters: {
      serviceType: OrgSilServiceType.ACTUALIZATION,
      applicationName: filterValues.actualization
    },
    query: actualizationQuery
  });

  useEffect(() => {
    notificationsSearch.applyFilters();
  }, []);

  const currentSearch = useMemo(
    () => (activeTab === 0 ? notificationsSearch : actualizationSearch),
    [activeTab, notificationsSearch, actualizationSearch]
  );

  const { filters: filterItems } = useOrgSilServiceFilters({
    onFilter: () => currentSearch.applyFilters()
  });

  const handleFilterChange = (id: string, value: unknown) => {
    if (id === 'applicationName') {
      if (activeTab === 0) {
        setFilterValues((prev) => ({
          ...prev,
          notifications: value as string
        }));
      } else {
        setFilterValues((prev) => ({
          ...prev,
          actualization: value as string
        }));
      }
    }
  };

  const handleTabChange = (newTab: number) => {
    setActiveTab(newTab);
    const targetSearch =
      newTab === 0 ? notificationsSearch : actualizationSearch;
    if (!targetSearch.query.data) {
      targetSearch.applyFilters();
    }
  };

  const handleAddNew = () => {
    navigate(PageRoutes.ORG_SIL_SERVICE_CREATE);
  };

  const handleRowClick = (row: OrgSilServiceView) => {
    if (!row) return;
    console.log(
      `click on "${row.applicationName}" with id: ${row.orgSilServiceId}`
    );
  };

  return (
    <>
      <TitleComponent
        title={t('commons.routes.ORG_SIL_SERVICE')}
        callToAction={[
          {
            icon: <Add />,
            buttonText: t('orgSilService.addAPI'),
            onActionClick: handleAddNew
          }
        ]}
      />

      <Grid
        container
        direction="row"
        alignItems={'center'}
        justifyContent={'space-between'}
        sx={{ mt: 6, mb: 4 }}
      >
        <FilterContainer
          items={filterItems}
          values={{
            applicationName:
              activeTab === 0
                ? filterValues.notifications
                : filterValues.actualization
          }}
          onChange={handleFilterChange}
        />
      </Grid>

      <ServiceTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        serviceConfigs={SERVICE_CONFIGS}
      />

      <ServiceDataGrid
        data={currentSearch.query.data}
        loading={currentSearch.query.isPending}
        onPaginationChange={currentSearch.handlePaginationChange}
        onRowClick={handleRowClick}
      />
    </>
  );
};

export default OrgSilServicesPage;
