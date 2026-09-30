import { Stack } from '@mui/material';
import { FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate, useParams } from 'react-router';

import { PagedOrgSubUnitOperators } from '@generated/core/data-contracts';

import TitleComponent, {
  ActionMenuItem
} from '@core/components/TitleComponent/TitleComponent';
import { useSearch } from '@core/hooks/useSearch';
import utils from '@core/utils';
import { PageRoutes } from '..';
import { SubUnitOperatorsDataGrid } from './components/SubUnitOperatorsDataGrid';
import {
  disableSubUnit,
  getOrgSubUnitById,
  getOrgSubUnitOperators
} from '@core/api/orgSubUnit';
import GenericDialog from '@core/components/GenericDialog/GenericDialog';
import { useEffect, useState } from 'react';
import { SubUnitSummary } from './components/SubUnitSummary';
import { setCustomBreadcrumbsItems } from '@core/store/AppStateStore';

export const SubUnitDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const initialFilters: FieldValues = utils.URI.decode(window.location.hash);
  const [disableDialogState, setDisableDialogState] = useState(false);

  const { organizationId: urlOrganizationId, subUnitCode: urlSubUnitCode } =
    useParams();

  const organizationId = Number(urlOrganizationId);
  const subUnitCode = String(urlSubUnitCode);

  if (isNaN(organizationId) || !subUnitCode) {
    navigate(PageRoutes.RESPONSES_ERROR);
  }

  const deleteSubUnitApi = disableSubUnit(organizationId, subUnitCode);
  const subUnitQuery = getOrgSubUnitById(organizationId, subUnitCode);
  const query = getOrgSubUnitOperators(organizationId, subUnitCode);

  const filteredSearch = useSearch({
    filters: initialFilters,
    query
  });

  const disableSubUnitAction: ActionMenuItem = {
    buttonText: t('subunits.detail.disableSubUnit'),
    color: 'error',
    variant: 'text',
    onActionClick: () => setDisableDialogState(true)
  };

  const linkOperatorAction: ActionMenuItem = {
    buttonText: t('subunits.detail.linkOperator'),
    variant: 'outlined',
    // TODO: add action when available
    onActionClick: () => null
  };

  // TODO: replace with current filters
  const onDeleteOperator = () => filteredSearch.applyFilters(initialFilters);

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
        pathname: generatePath(PageRoutes.ORGANIZATIONS_SUB_UNITS, {
          organizationId
        }),
        label: t('subunits.list.title', { orgName: urlOrganizationId }),
        id: 'SUBUNITS_LIST'
      },
      {
        pathname: '#',
        label: subUnitCode,
        id: 'SUB_UNIT_DETAIL'
      }
    ]);
  }, [t, urlOrganizationId, organizationId]);

  return (
    <>
      <GenericDialog
        title={t('subunits.detail.disable.title', { subUnitCode })}
        message={t('subunits.detail.disable.message')}
        open={disableDialogState}
        onClose={() => setDisableDialogState(false)}
        onConfirm={() => {
          deleteSubUnitApi.mutateAsync();
          setDisableDialogState(false);
          filteredSearch.applyFilters(initialFilters);
        }}
        confirmLabel={t('commons.confirm')}
        cancelLabel={t('commons.cancel')}
      />
      <Stack gap={5}>
        <Stack>
          <TitleComponent
            title={subUnitCode}
            chip={{
              label: t(`subunits.status.${subUnitQuery.data?.status}`),
              color:
                subUnitQuery.data?.status == 'ACTIVE' ? 'default' : 'neutral'
            }}
            callToAction={[disableSubUnitAction]}
          />
        </Stack>
        <SubUnitSummary
          subUnitCode={subUnitQuery.data?.subUnitCode}
          subUnitType={subUnitQuery.data?.subUnitType}
          subUnitName={subUnitQuery.data?.subUnitName}
          creationDate={subUnitQuery.data?.creationDate}
        />
        <Stack component="section" gap={3}>
          <TitleComponent
            variant="h4"
            title={t('subunits.detail.operators')}
            callToAction={[linkOperatorAction]}
          />
          <SubUnitOperatorsDataGrid
            data={query?.data as PagedOrgSubUnitOperators}
            organizationId={organizationId}
            subUnitCode={subUnitCode}
            onDelete={onDeleteOperator}
          />
        </Stack>
      </Stack>
    </>
  );
};
