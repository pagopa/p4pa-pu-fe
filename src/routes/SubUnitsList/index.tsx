import { getPagedOrgSubUnits, SubUnitsFilters } from '@core/api/subunits';
import { useSearch } from '@core/hooks/useSearch';
import utils from '@core/utils';
import { Stack } from '@mui/material';
import { FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SubUnitsDataGrid } from './components/SubUnitsDataGrid';
import { PagedOrgSubUnit } from '@generated/core/data-contracts';
import { generatePath, useNavigate, useParams } from 'react-router';
import { PageRoutes } from '..';
import TitleComponent from '@core/components/TitleComponent/TitleComponent';
import { setCustomBreadcrumbsItems } from '@core/store/AppStateStore';
import { useCallback, useEffect, useState } from 'react';
import FilterContainer from '@core/components/FilterContainer/FilterContainer';
import { useSubUnitsFilters } from '@core/hooks/useSubunitsListFilters';

export const SubUnitsList = () => {
  const { t } = useTranslation();
  const initialFilters: FieldValues = utils.URI.decode(window.location.hash);

  const [filterValues, setFilterValues] =
    useState<SubUnitsFilters>(initialFilters);

  const { filters: filterItems } = useSubUnitsFilters();
  const navigate = useNavigate();

  const handleFilterChange = useCallback((id: string, value: unknown) => {
    setFilterValues((prev) => ({
      ...prev,
      [id]: value as string
    }));
  }, []);

  const { organizationId: urlOrganizationId } = useParams();
  const organizationId = Number(urlOrganizationId);

  if (isNaN(organizationId)) {
    navigate(PageRoutes.RESPONSES_ERROR);
  }

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

  return (
    <Stack gap={5}>
      <Stack>
        <TitleComponent
          title={t('subunits.list.title', { orgName: urlOrganizationId })}
          description={t('subunits.list.description')}
        />
      </Stack>
      <Stack component="section" gap={3}>
        <FilterContainer
          items={filterItems}
          values={filterValues}
          onChange={handleFilterChange}
          onSubmit={applyFilters}
        />
        <SubUnitsDataGrid data={query?.data as PagedOrgSubUnit} />
      </Stack>
    </Stack>
  );
};
