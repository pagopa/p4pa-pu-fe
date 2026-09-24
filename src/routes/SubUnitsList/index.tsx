import { getPagedOrgSubUnits } from '@core/api/subunits';
import { useSearch } from '@core/hooks/useSearch';
import utils from '@core/utils';
import { Stack } from '@mui/material';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SubUnitsDataGrid } from './components/SubUnitsDataGrid';
import { PagedOrgSubUnit } from '@generated/core/data-contracts';
import { SubUnitsFilters } from './components/SubUnitsFilters';
import { generatePath, useNavigate, useParams } from 'react-router';
import { PageRoutes } from '..';
import TitleComponent from '@core/components/TitleComponent/TitleComponent';
import { setCustomBreadcrumbsItems } from '@core/store/AppStateStore';
import { useEffect } from 'react';

export const SubUnitsList = () => {
  const { t } = useTranslation();
  const initialFilters: FieldValues = utils.URI.decode(window.location.hash);
  const navigate = useNavigate();

  const form = useForm({ defaultValues: initialFilters });

  const { organizationId: urlOrganizationId, orgName } = useParams();
  const organizationId = Number(urlOrganizationId);

  if (isNaN(organizationId)) {
    navigate(PageRoutes.RESPONSES_ERROR);
  }

  const query = getPagedOrgSubUnits(organizationId);

  const campaignNotifications = useSearch({
    filters: initialFilters,
    query
  });

  useEffect(() => {
    setCustomBreadcrumbsItems([
      { pathname: PageRoutes.ORGANIZATIONS, id: 'ORGANIZATIONS' },
      {
        pathname: generatePath(PageRoutes.ORGANIZATIONS_DETAIL, {
          organizationId
        }),
        label: orgName,
        id: 'ORGANIZATIONS_DETAIL'
      },
      {
        pathname: '#',
        label: t('subunits.list.title', { orgName }),
        id: 'SUBUNITS_LIST'
      }
    ]);
  }, [t, orgName, organizationId]);

  const clearFilters = () => {
    window.location.hash = '';
    form.reset({
      subUnitCode: '',
      subUnitType: '',
      status: ''
    });
    campaignNotifications.applyFilters({});
  };

  return (
    <Stack gap={5}>
      <TitleComponent title={t('subunits.list.title', { orgName })} />
      <FormProvider {...form}>
        <form
          noValidate
          onSubmit={form.handleSubmit(campaignNotifications.applyFilters)}
        >
          <Stack component="section" gap={2}>
            <SubUnitsFilters clearFilters={clearFilters} />
            <SubUnitsDataGrid data={query?.data as PagedOrgSubUnit} />
          </Stack>
        </form>
      </FormProvider>
    </Stack>
  );
};
