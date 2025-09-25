import ActionMenu from '../../../components/ActionMenu/ActionMenu';
import { DebtPositionTypeOrgDTO } from '../../../../generated/data-contracts';
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { useTranslation } from 'react-i18next';

type ActionMenuProps = {
  row: DebtPositionTypeOrgDTO;
  onDelete: (row: DebtPositionTypeOrgDTO) => void;
};

export const GridActionMenu = ({ row, onDelete }: ActionMenuProps) => {
  const { t } = useTranslation();

  const deleteItem = () => {
    onDelete(row);
  };

  return (
    <ActionMenu
      rowId={row.debtPositionTypeId}
      menuItems={[
        {
          icon: (
            <RemoveCircleOutline
              fontSize="small"
              color="error"
              aria-label="remove operator detail item"
              data-testid={`remove-detail-${row.debtPositionTypeId}`}
            />
          ),
          label: t('commons.onlyRemove'),
          action: deleteItem
        },
        {
          icon: (
            <OpenInNew
              color="primary"
              fontSize="small"
              aria-label="go to operator detail item"
              data-testid={`navigate-to-detail-${row.debtPositionTypeId}`}
            />
          ),
          label: t('commons.goToDetail'),
          // TODO: add go to detail
          action: () => null
        }
      ]}
    />
  );
};
