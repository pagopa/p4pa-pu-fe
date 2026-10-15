import TitleComponent from '@core/components/TitleComponent/TitleComponent';
import { useSearch } from '@core/hooks/useSearch';
import { generatePath, useNavigate, useParams } from 'react-router';
import {
  getOrgSubUnitNotRelatedOperators,
  useAddOperatorsToOrgSubUnit
} from '@core/api/orgSubUnit';
import { Trans, useTranslation } from 'react-i18next';
import { useState } from 'react';
import FilterContainer, {
  COMPONENT_TYPE
} from '@core/components/FilterContainer/FilterContainer';
import { GridSelector } from '@core/components/GridSelector';
import utils from '@core/utils';
import { OrgSubUnitOperator } from '@generated/core/data-contracts';
import { GridColDef } from '@mui/x-data-grid';
import { FilterFieldValue } from '@core/models/Filters';
import { Search } from '@mui/icons-material';
import WizardStepButtons from '@core/components/Wizard/WizardStepButtons';
import { PageRoutes } from '..';

export const SubunitAssignOperator = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { organizationId, subUnitCode } = useParams();

  const { lastName, fiscalCode, page, size, sort } = utils.URI.decode(
    window.location.hash
  );

  const [filters, setFilters] = useState({
    lastName,
    fiscalCode,
    page,
    size,
    sort
  });

  const [enabledSubunitsOperators, setEnabledSubunitsOperators] = useState<
    Array<string>
  >([]);

  const notRelatedOperatorsSearch = getOrgSubUnitNotRelatedOperators(
    Number(organizationId),
    subUnitCode || ''
  );

  const subunitOperators = useAddOperatorsToOrgSubUnit(
    Number(organizationId),
    subUnitCode || ''
  );

  const {
    query: { data },
    applyFilters
  } = useSearch({
    query: notRelatedOperatorsSearch,
    filters
  });

  const addSubunitsToOperators = async () => {
    try {
      await subunitOperators.mutateAsync({
        mappedExternalUserIds: enabledSubunitsOperators
      });
      utils.notify.emit(t('commons.done'), 'success');
      navigate(
        generatePath(PageRoutes.SUB_UNIT_DETAIL, {
          organizationId: String(organizationId),
          subUnitCode: subUnitCode || ''
        })
      );
    } catch (error) {
      console.error('Operation failed:', error);
      utils.notify.emit(t('errors.generic'));
    }
  };

  const handleFilterChange = (id: string, value: FilterFieldValue) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [id]: value
    }));
  };

  const handleSubmit = () => {
    if (enabledSubunitsOperators.length) {
      utils.dialog.open({
        ['data-testid']: 'operator-subunits-dialog',
        title: t('subunits.assignOperators.dialog.title'),
        message: (
          <Trans
            i18nKey="subunits.assignOperators.dialog.message"
            values={{
              subUnitCode: subUnitCode || '',
              count: enabledSubunitsOperators.length
            }}
          />
        ),
        confirmLabel: t('commons.confirm'),
        cancelLabel: t('commons.close'),
        onConfirm: () => {
          addSubunitsToOperators();
          utils.dialog.close();
        },
        onClose: () => utils.dialog.close()
      });
    } else {
      utils.notify.emit(t('subunits.assignOperators.dialog.noSelection'));
    }
  };

  const handleExit = () => {
    navigate(
      generatePath(PageRoutes.OPERATORS_DETAIL, {
        organizationId: String(organizationId),
        subUnitCode: subUnitCode
      })
    );
  };

  const columns: Array<GridColDef<OrgSubUnitOperator>> = [
    {
      field: 'mappedExternalUserId',
      headerName: t('commons.id'),
      flex: 1,
      type: 'string',
      sortable: false
    },
    {
      field: 'lastName',
      headerName: t('commons.name'),
      flex: 1,
      type: 'string',
      sortable: false,
      renderCell: (params) => `${params.row.firstName} ${params.row.lastName}`
    },
    {
      field: 'fiscalCode',
      headerName: t('commons.fiscalCode'),
      flex: 1,
      type: 'string',
      sortable: false
    }
  ];

  const filterItems = [
    {
      id: 'lastName',
      type: COMPONENT_TYPE.textField,
      label: t('subunits.assignOperators.searchByLastName'),
      adornment: <Search />,
      gridWidth: 5
    },
    {
      id: 'fiscalCode',
      type: COMPONENT_TYPE.textField,
      label: t('subunits.assignOperators.searchByFiscalCode'),
      adornment: <Search />,
      gridWidth: 5
    },
    {
      type: COMPONENT_TYPE.button,
      label: t('commons.filters.filterResults'),
      gridWidth: 2,
      onClick: () => applyFilters(filters)
    }
  ];

  return (
    <>
      <TitleComponent
        title={t('subunits.assignOperators.title')}
        description={t('subunits.assignOperators.description', {
          subUnitCode: subUnitCode || ''
        })}
        sx={{ mt: 2 }}
      />

      <FilterContainer
        onChange={handleFilterChange}
        values={filters}
        items={filterItems}
        sx={{ mt: 1, mb: 3 }}
      />

      <GridSelector<OrgSubUnitOperator, string>
        show={true}
        data={data?.content || []}
        getRowId={(row) => {
          return row.mappedExternalUserId;
        }}
        columns={columns}
        selectedIds={enabledSubunitsOperators}
        onSelectionChange={setEnabledSubunitsOperators}
        totalPages={data?.totalPages || 1}
        selectedCountLabel={t('subunits.assignOperators.countLabel', {
          count: enabledSubunitsOperators.length
        })}
        showSelectedAlert={enabledSubunitsOperators.length > 0}
        clearButtonLabel={t('commons.deleteSelection')}
      />
      <WizardStepButtons
        onBack={handleExit}
        onNext={handleSubmit}
        nextLabel={t('commons.affiliate')}
      />
    </>
  );
};
