import { useCallback, useEffect, useState } from 'react';
import type { FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate, useParams } from 'react-router';
import AddIcon from '@mui/icons-material/Add';
import type { PagedOrgSubUnit } from '@generated/core/data-contracts';

import type { SubUnitsFilters } from '@core/api/orgSubUnit';
import { getPagedOrgSubUnits } from '@core/api/orgSubUnit';

import FilterContainer from '@core/components/FilterContainer/FilterContainer';
import type { ActionMenuItem } from '@core/components/TitleComponent/TitleComponent';
import TitleComponent from '@core/components/TitleComponent/TitleComponent';
import { useSearch } from '@core/hooks/useSearch';
import { useSubUnitsFilters } from '@core/hooks/useSubunitsListFilters';
import { setCustomBreadcrumbsItems } from '@core/store/AppStateStore';
import utils from '@core/utils';
import { PageRoutes } from '..';

import { SubUnitsDataGrid } from './components/SubUnitsDataGrid';
import Stack from '@mui/material/Stack';

export const SubUnitsList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const initialFilters: FieldValues = utils.URI.decode(window.location.hash);

  const [filterValues, setFilterValues] =
    useState<SubUnitsFilters>(initialFilters);

  const { filters: filterItems } = useSubUnitsFilters();

  const handleFilterChange = useCallback((id: string, value: unknown) => {
    setFilterValues((prev) => ({
      ...prev,
      [id]: value as string
    }));
  }, []);

  const { organizationId: urlOrganizationId } = useParams();
  const organizationId = Number(urlOrganizationId);

  useEffect(() => {
    if (isNaN(organizationId)) {
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  }, [organizationId]);

  const query = getPagedOrgSubUnits(organizationId);

  const campaignNotifications = useSearch({
    filters: initialFilters,
    query
  });

  const applyFilters = useCallback(() => {
    campaignNotifications.applyFilters(filterValues);
  }, [campaignNotifications, filterValues]);

  useEffect(() => {
    setCustomBreadcrumbsItems([
      { pathname: PageRoutes.ORGANIZATIONS, id: 'ORGANIZATIONS' },
      {
        pathname: generatePath(PageRoutes.ORGANIZATIONS_DETAIL, {
          organizationId
        }),
        label: urlOrganizationId,
        id: 'ORGANIZATIONS_DETAIL'
      },
      {
        pathname: '#',
        label: t('subunits.list.title', { orgName: urlOrganizationId }),
        id: 'SUBUNITS_LIST'
      }
    ]);
  }, [t, urlOrganizationId, organizationId]);

  const createSubUnitAction: ActionMenuItem = {
    buttonText: t('subunits.list.create'),
    icon: <AddIcon />,
    onActionClick: () => {
      navigate(
        generatePath(PageRoutes.SUB_UNIT_CREATE, {
          organizationId
        })
      );
    }
  };

  return (
    <Stack gap={5}>
      <Stack>
        <TitleComponent
          title={t('subunits.list.title', { orgName: urlOrganizationId })}
          description={t('subunits.list.description')}
          callToAction={[createSubUnitAction]}
        />
      </Stack>
      <Stack component="section" gap={3}>
        <FilterContainer
          items={filterItems}
          values={filterValues}
          onChange={handleFilterChange}
          onSubmit={applyFilters}
        />
        <SubUnitsDataGrid
          data={query?.data as PagedOrgSubUnit}
          organizationId={organizationId}
        />
      </Stack>
    </Stack>
  );
};
