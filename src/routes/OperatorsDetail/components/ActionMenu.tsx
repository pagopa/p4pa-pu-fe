import ActionMenu from '../../../components/ActionMenu/ActionMenu';
import { DebtPositionTypeOrgDTO } from '../../../../generated/data-contracts';
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '../..';
import utils from '../../../utils';

type ActionMenuProps = {
  row: DebtPositionTypeOrgDTO;
  onDelete: (row: DebtPositionTypeOrgDTO) => void;
  canDelete: boolean;
};

export const GridActionMenu = ({
  row,
  onDelete: onDeleteProp,
  canDelete
}: ActionMenuProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const onDelete = () => {
    onDeleteProp(row);
  };

  const onDetail = () => {
    if (row?.debtPositionTypeOrgId) {
      const path = generatePath(PageRoutes.DEBT_TYPE_ORG_DETAIL, {
        debtPositionTypeOrgId: row.debtPositionTypeOrgId
      });
      navigate(path);
    } else {
      utils.notify.emit(t('errors.generic'));
    }
  };

  const menuItems = [
    {
      icon: (
        <OpenInNew
          color="primary"
          fontSize="small"
          aria-label={t('commons.goToDetail')}
          data-testid={`navigate-to-detail-${row.debtPositionTypeId}`}
        />
      ),
      label: t('commons.goToDetail'),
      action: onDetail
    }
  ];

  if (canDelete) {
    menuItems.push({
      icon: (
        <RemoveCircleOutline
          fontSize="small"
          color="error"
          aria-label={t('commons.onlyRemove')}
          data-testid={`remove-detail-${row.debtPositionTypeId}`}
        />
      ),
      label: t('commons.onlyRemove'),
      action: onDelete
    });
  }

  return <ActionMenu rowId={row.debtPositionTypeId} menuItems={menuItems} />;
};
