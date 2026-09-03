import { useState } from 'react';
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
  OrgSilServiceView
} from '../../../generated/core/client';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '..';
import { FilterFieldValue } from '../../models/Filters';
import utils from '../../utils';

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

  const initialFilters = utils.URI.decode(window.location.hash);

  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState<OrgSilServicesFilters>({
    ...initialFilters,
    serviceType: SERVICE_CONFIGS[activeTab].type
  });

  const query = orgSilServiceApi.getOrgSilServices({
    organizationId: Number(organizationId)
  });

  const silSearch = useSearch({
    filters,
    query
  });

  const { filters: filterItems } = useOrgSilServiceFilters();

  const handleTabChange = async (newTab: number) => {
    const serviceType = SERVICE_CONFIGS[newTab].type;
    setActiveTab(newTab);
    setFilters({ serviceType });
    silSearch.applyFilters({
      serviceType
    });
  };

  const handleAddNew = () => {
    navigate(PageRoutes.ORG_SIL_SERVICE_CREATE);
  };

  const handleRowClick = (row: OrgSilServiceView) => {
    if (!row?.orgSilServiceId) return;

    navigate(
      generatePath(PageRoutes.ORG_SIL_SERVICE_DETAIL, {
        orgSilServiceId: row.orgSilServiceId.toString()
      })
    );
  };

  const handleFilterChange = (id: string, value: FilterFieldValue) =>
    setFilters({ ...filters, [id]: value });

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
        accessibleTitle={t('orgSilService.accessibleTitle')}
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
          values={filters}
          onChange={handleFilterChange}
          onSubmit={() => silSearch.applyFilters(filters)}
        />
      </Grid>

      <ServiceTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        serviceConfigs={SERVICE_CONFIGS}
      />
      <ServiceDataGrid
        data={silSearch.query.data}
        onRowClick={handleRowClick}
      />
    </>
  );
};

export default OrgSilServicesPage;
