import { Stack } from '@mui/material';
import { FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { PagedOrgSubUnitOperators } from '@generated/core/data-contracts';

import TitleComponent, {
  ActionMenuItem
} from '@core/components/TitleComponent/TitleComponent';
import { useSearch } from '@core/hooks/useSearch';
import utils from '@core/utils';
import { PageRoutes } from '..';
import { SubUnitOperatorsDataGrid } from './components/SubUnitOperatorsDataGrid';
import {
  deleteOrgSubUnitById,
  getOrgSubUnitOperators
} from '@core/api/orgSubUnit';

export const SubUnitDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const initialFilters: FieldValues = utils.URI.decode(window.location.hash);

  const { organizationId: urlOrganizationId, subUnitCode: urlSubUnitCode } =
    useParams();

  const organizationId = Number(urlOrganizationId);
  const subUnitCode = String(urlSubUnitCode);

  if (isNaN(organizationId) || !subUnitCode) {
    navigate(PageRoutes.RESPONSES_ERROR);
  }

  const deleteSubUnit = deleteOrgSubUnitById(organizationId, subUnitCode);

  const query = getOrgSubUnitOperators(organizationId, subUnitCode);

  useSearch({
    filters: initialFilters,
    query
  });

  const disableSubUnit: ActionMenuItem = {
    buttonText: t('subunits.detail.disableSubUnit'),
    color: 'error',
    variant: 'text',
    // TODO: add action
    onActionClick: () => null
  };

  const linkOperator: ActionMenuItem = {
    buttonText: t('subunits.detail.linkOperator'),
    variant: 'outlined',
    // TODO: add action
    onActionClick: () => null
  };

  return (
    <Stack gap={5}>
      <Stack>
        <TitleComponent title={subUnitCode} callToAction={[disableSubUnit]} />
      </Stack>
      <Stack component="section" gap={3}>
        <TitleComponent
          variant="h4"
          title={t('subunits.detail.operators')}
          callToAction={[linkOperator]}
        />
        <SubUnitOperatorsDataGrid
          data={query?.data as PagedOrgSubUnitOperators}
        />
      </Stack>
    </Stack>
  );
};
