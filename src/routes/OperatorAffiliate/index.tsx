import { useNavigate, useParams } from 'react-router';
import {
  useEnbleDebtPositionTypeOrgsForOperator,
  useOperatorDebtPositionTypeOrgSearch
} from '../../api/organizationOperators';
import { PageRoutes } from '..';
import { useSearch } from '../../hooks/useSearch';
import { GridColDef } from '@mui/x-data-grid';
import { Trans, useTranslation } from 'react-i18next';
import { GridSelector } from '../../components/GridSelector';
import { DebtPositionTypeOrgDTO } from '../../../generated/core/data-contracts';
import { useState } from 'react';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import FilterContainer, {
  COMPONENT_TYPE
} from '../../components/FilterContainer/FilterContainer';
import Search from '@mui/icons-material/Search';
import { useDebtPositionTypesByOrg } from '../../hooks/useDebtPositionTypesByOrg';
import { FilterFieldValue } from '../../models/Filters';
import WizardStepButtons from '../../components/Wizard/WizardStepButtons';
import utils from '../../utils';

export const OperatorAffiliate = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    debtPositionTypeOrgDescription,
    debtPositionTypeOrgCode,
    debtPositionTypeId,
    page,
    size,
    sort
  } = utils.URI.decode(window.location.hash);

  const [filters, setFilters] = useState({
    debtPositionTypeOrgDescription,
    debtPositionTypeOrgCode,
    debtPositionTypeId,
    page,
    size,
    sort
  });
  const [enabledDebtPositionCodes, setEnabledDebtPositionCodes] = useState<
    Array<number>
  >([]);

  const {
    organizationId: paramOrganizationId,
    mappedExternalUserId: paramMappedExternalUserId,
    operatorName
  } = useParams();

  const organizationId = Number(paramOrganizationId);
  const mappedExternalUserId = String(paramMappedExternalUserId);

  if (isNaN(organizationId) || !mappedExternalUserId) {
    navigate(PageRoutes.RESPONSES_ERROR);
  }

  const debtPositionTypesByOrg = useDebtPositionTypesByOrg({
    organizationId
  });

  const operatorDebtPositionTypeOrgSearch =
    useOperatorDebtPositionTypeOrgSearch(
      Number(organizationId),
      String(mappedExternalUserId)
    );

  const {
    query: { data },
    applyFilters
  } = useSearch({
    query: operatorDebtPositionTypeOrgSearch,
    filters
  });

  const affiliateDebtPositionTypes = useEnbleDebtPositionTypeOrgsForOperator(
    organizationId,
    mappedExternalUserId
  );

  const filterItems = [
    {
      id: 'debtPositionTypeOrgDescription',
      type: COMPONENT_TYPE.textField,
      label: t('commons.searchForDescription'),
      adornment: <Search />,
      gridWidth: 4
    },
    {
      id: 'debtPositionTypeOrgCode',
      type: COMPONENT_TYPE.textField,
      label: t('commons.searchForCode'),
      adornment: <Search />,
      gridWidth: 3
    },
    {
      type: COMPONENT_TYPE.select,
      id: 'debtPositionTypeId',
      label: t('commons.debtType'),
      gridWidth: 4,
      options: debtPositionTypesByOrg?.data?.optionsMap
    },
    {
      type: COMPONENT_TYPE.button,
      label: t('commons.filters.filterResults'),
      gridWidth: 1,
      onClick: () => applyFilters(filters)
    }
  ];

  const columns: Array<GridColDef<DebtPositionTypeOrgDTO>> = [
    {
      field: 'code',
      headerName: t('OperatorDetail.code'),
      flex: 1,
      type: 'string'
    },
    {
      field: 'debtPositionTypeDescription',
      headerName: t('OperatorDetail.debtPositionTypeDescription'),
      flex: 0.8,
      type: 'string'
    },
    {
      field: 'description',
      headerName: t('commons.description'),
      flex: 1,
      type: 'string'
    }
  ];

  const handleFilterChange = (id: string, value: FilterFieldValue) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [id]: value
    }));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const affiliateNewDebtPositionTypes = async () => {
    try {
      await affiliateDebtPositionTypes.mutateAsync({
        debtPositionTypeOrgIds: enabledDebtPositionCodes
      });
      navigate(PageRoutes.RESPONSES_SUCCESS, {
        replace: true,
        state: {
          category: 'operator-affiliate',
          i18nParams: {
            count: enabledDebtPositionCodes.length,
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

  const handleSubmit = () => {
    if (enabledDebtPositionCodes.length) {
      utils.dialog.open({
        ['data-testid']: 'affiliate-confirm-dialog',
        title: t('OperatorDetail.affiliate.dialog.title'),
        message: (
          <Trans
            i18nKey="OperatorDetail.affiliate.dialog.message"
            values={{ operatorName, count: enabledDebtPositionCodes.length }}
          />
        ),
        confirmLabel: t('commons.confirm'),
        cancelLabel: t('commons.close'),
        onConfirm: () => {
          affiliateNewDebtPositionTypes();
          utils.dialog.close();
        },
        onClose: () => utils.dialog.close()
      });
    } else {
      utils.notify.emit(t('OperatorDetail.affiliate.noSelection'));
    }
  };

  return (
    <>
      <TitleComponent title={t('OperatorDetail.affiliate.title')} />
      <FilterContainer
        onChange={handleFilterChange}
        values={filters}
        items={filterItems}
      />
      <GridSelector<DebtPositionTypeOrgDTO, number>
        show={true}
        data={data?.content || []}
        columns={columns}
        getRowId={(row) => {
          if (!row.debtPositionTypeOrgId) {
            throw new Error('debtPositionTypeOrgId not found');
          } else {
            return row?.debtPositionTypeOrgId;
          }
        }}
        selectedIds={enabledDebtPositionCodes}
        onSelectionChange={setEnabledDebtPositionCodes}
        totalPages={data?.totalPages || 1}
        selectedCountLabel={t('OperatorDetail.affiliate.countLabel', {
          count: enabledDebtPositionCodes.length
        })}
        showSelectedAlert={enabledDebtPositionCodes.length > 0}
        clearButtonLabel={t('commons.deleteSelection')}
      />
      <WizardStepButtons
        onBack={handleBack}
        onNext={handleSubmit}
        nextLabel={t('commons.affiliate')}
      />
    </>
  );
};
