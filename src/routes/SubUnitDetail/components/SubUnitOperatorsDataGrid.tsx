import { useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardIos';

import {
  OrgSubUnitOperator,
  PagedOrgSubUnitOperators
} from '@generated/core/data-contracts';

import ActionMenu, {
  MenuItemProps
} from '@core/components/ActionMenu/ActionMenu';
import CustomDataGrid from '@core/components/DataGrid/CustomDataGrid';
import GenericDialog from '@core/components/GenericDialog/GenericDialog';
import { deleteSingleOperatorFromOrgSubUnit } from '@core/api/orgSubUnit';
import utils from '@core/utils';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '@core/routes';

type SubUnitsDataGridProps = {
  data: PagedOrgSubUnitOperators;
  organizationId: number;
  subUnitCode: string;
  onDelete: () => void;
};

export const SubUnitOperatorsDataGrid = ({
  data,
  organizationId,
  subUnitCode,
  onDelete
}: SubUnitsDataGridProps) => {
  const { t } = useTranslation();
  const [deleteDialogState, setDeleteDialogState] = useState(false);
  const navigate = useNavigate();

  const [selectedOperator, setSelectedOperator] = useState<
    OrgSubUnitOperator | undefined
  >(undefined);

  const deleteOperatorApi = deleteSingleOperatorFromOrgSubUnit(
    organizationId,
    subUnitCode
  );

  const deleteOperatorAction = (
    operator: OrgSubUnitOperator
  ): MenuItemProps => ({
    variant: 'error',
    label: t('commons.delete'),
    icon: <CancelIcon />,
    action: () => {
      setSelectedOperator(operator);
      setDeleteDialogState(true);
    }
  });

  const detailAction = (operator: OrgSubUnitOperator): MenuItemProps => ({
    label: t('commons.detail'),
    variant: 'main',
    icon: <ArrowForwardIcon />,
    action: () => {
      navigate(
        generatePath(PageRoutes.OPERATORS_DETAIL, {
          organizationId,
          mappedExternalUserId: operator.mappedExternalUserId
        })
      );
    }
  });

  const onDeleteOperator = async () => {
    if (!selectedOperator) {
      utils.notify.emit(t('errors.generic'));
      return;
    }
    try {
      await deleteOperatorApi.mutateAsync(
        selectedOperator.mappedExternalUserId
      );
      onDelete();
    } catch {
      utils.notify.emit(t('errors.generic'));
    } finally {
      setDeleteDialogState(false);
      setSelectedOperator(undefined);
    }
  };

  const columns: Array<GridColDef<OrgSubUnitOperator>> = [
    {
      field: 'mappedExternalUserId',
      headerName: t('commons.id').toUpperCase(),
      flex: 1
    },
    {
      field: 'operatorName',
      headerName: t('commons.name'),
      flex: 1,
      renderCell: ({ row }) => {
        const name = `${row.firstName ?? ''} ${row.lastName ?? ''}`;
        const missingName = name.trim() === '';
        return missingName ? ' _ ' : name;
      }
    },
    {
      field: 'fiscalCode',
      headerName: t('commons.fiscalCode'),
      flex: 1,
      renderCell: ({ value }) => value || ' _ '
    },
    {
      field: 'action',
      headerName: '',
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }) => (
        <ActionMenu
          rowId={row.mappedExternalUserId}
          menuItems={[deleteOperatorAction(row), detailAction(row)]}
        />
      )
    }
  ];

  const operatorName = (operator?: OrgSubUnitOperator) => {
    const name = `${operator?.firstName ?? ''} ${operator?.lastName ?? ''}`;
    const missingName = name.trim() === '';
    return missingName ? operator?.mappedExternalUserId : name;
  };

  return (
    <>
      <GenericDialog
        title={t('subunits.detail.deleteOperator.title', {
          operatorName: operatorName(selectedOperator),
          subUnitCode
        })}
        message={t('subunits.detail.deleteOperator.message')}
        open={deleteDialogState}
        onClose={() => setDeleteDialogState(false)}
        onConfirm={onDeleteOperator}
        confirmLabel={t('commons.confirm')}
        cancelLabel={t('commons.cancel')}
      />
      <CustomDataGrid
        rows={data?.content || []}
        getRowId={(row: OrgSubUnitOperator) => row.mappedExternalUserId}
        columns={columns}
        disableColumnMenu
        disableColumnResize
        totalPages={data?.totalPages || 0}
      />
    </>
  );
};
