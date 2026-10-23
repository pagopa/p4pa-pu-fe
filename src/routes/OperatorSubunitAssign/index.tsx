import TitleComponent from '@core/components/TitleComponent/TitleComponent';
import { useSearch } from '@core/hooks/useSearch';
import { generatePath, useNavigate, useParams } from 'react-router';
import {
  getAssignableOrgSubUnits,
  useAddOrgSubUnitsToOperator
} from '@core/api/orgSubUnit';
import { Trans, useTranslation } from 'react-i18next';
import { useState } from 'react';
import FilterContainer, {
  COMPONENT_TYPE
} from '@core/components/FilterContainer/FilterContainer';
import { GridSelector } from '@core/components/GridSelector';
import utils from '@core/utils';
import type { OrgSubUnit } from '@generated/core/data-contracts';
import type { GridColDef } from '@mui/x-data-grid';
import type { FilterFieldValue } from '@core/models/Filters';
import WizardStepButtons from '@core/components/Wizard/WizardStepButtons';
import { PageRoutes } from '..';
import Search from '@mui/icons-material/Search';

export const OperatorSubunitAssign = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { organizationId, mappedExternalUserId, operatorName } = useParams();

  const { subUnitCode, subUnitName, page, size, sort } = utils.URI.decode(
    window.location.hash
  );

  const [filters, setFilters] = useState({
    subUnitCode,
    subUnitName,
    page,
    size,
    sort
  });

  const [enabledSubunitCodes, setEnabledSubunitCodes] = useState<Array<string>>(
    []
  );

  const operatorSubunitAssignSearch = getAssignableOrgSubUnits(
    Number(organizationId),
    String(mappedExternalUserId)
  );

  const operatorSubunits = useAddOrgSubUnitsToOperator(
    Number(organizationId),
    String(mappedExternalUserId)
  );

  const {
    query: { data },
    applyFilters
  } = useSearch({
    query: operatorSubunitAssignSearch,
    filters
  });

  const addOrgSubUnitsToOperator = async () => {
    try {
      await operatorSubunits.mutateAsync({
        orgSubUnitCodes: enabledSubunitCodes
      });
      navigate(PageRoutes.RESPONSES_SUCCESS, {
        replace: true,
        state: {
          category: 'subunits-assigned',
          i18nParams: {
            count: enabledSubunitCodes.length,
            operatorName
          },
          organizationId,
          mappedExternalUserId
        }
      });
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
    if (enabledSubunitCodes.length) {
      utils.dialog.open({
        ['data-testid']: 'operator-subunits-dialog',
        title: t('subunits.assignPage.dialog.title'),
        message: (
          <Trans
            i18nKey="subunits.assignPage.dialog.message"
            values={{ operatorName, count: enabledSubunitCodes.length }}
          />
        ),
        confirmLabel: t('commons.confirm'),
        cancelLabel: t('commons.close'),
        onConfirm: () => {
          addOrgSubUnitsToOperator();
          utils.dialog.close();
        },
        onClose: () => utils.dialog.close()
      });
    } else {
      utils.notify.emit(t('subunits.assignPage.dialog.noSelection'));
    }
  };

  const handleExit = () => {
    navigate(
      generatePath(PageRoutes.OPERATORS_DETAIL, {
        organizationId: String(organizationId),
        mappedExternalUserId: mappedExternalUserId ?? ''
      })
    );
  };

  const columns: Array<GridColDef<OrgSubUnit>> = [
    {
      field: 'subUnitCode',
      headerName: t('subunits.subUnitCode'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'subUnitType',
      headerName: t('subunits.subUnitType'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'subUnitName',
      headerName: t('subunits.subUnitName'),
      flex: 1,
      type: 'string'
    }
  ];

  const filterItems = [
    {
      id: 'subUnitCode',
      type: COMPONENT_TYPE.textField,
      label: t('subunits.assignPage.searchBysubUnitCode'),
      adornment: <Search />,
      gridWidth: 5
    },
    {
      id: 'subUnitName',
      type: COMPONENT_TYPE.textField,
      label: t('subunits.assignPage.searchBysubUnitName'),
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
        title={t('subunits.assignPage.title')}
        description={t('subunits.assignPage.description', {
          operatorName: operatorName || mappedExternalUserId
        })}
        sx={{ mt: 2 }}
      />

      <FilterContainer
        onChange={handleFilterChange}
        values={filters}
        items={filterItems}
        sx={{ mt: 1, mb: 3 }}
      />
      <GridSelector<OrgSubUnit, string>
        show={true}
        data={data?.content || []}
        getRowId={(row) => {
          return row.subUnitCode;
        }}
        columns={columns}
        selectedIds={enabledSubunitCodes}
        onSelectionChange={setEnabledSubunitCodes}
        totalPages={data?.totalPages || 1}
        selectedCountLabel={t('subunits.assignPage.countLabel', {
          count: enabledSubunitCodes.length
        })}
        showSelectedAlert={enabledSubunitCodes.length > 0}
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
