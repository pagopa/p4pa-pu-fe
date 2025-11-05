import { useTranslation } from 'react-i18next';
import { HomeDrawerListItem } from './HomeDrawerListItem';
import { useAppNavigate } from '../../../hooks/useAppNavigation';
import { generatePath } from 'react-router';
import { PageRoutes } from '../..';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DescriptionIcon from '@mui/icons-material/Description';
import { DashboardByFc } from '../../../../generated/data-contracts';
import { DrawerItemConfig } from '../models';

type HomeDrawerFCProps = {
  searchValue: string;
  searchResults: DashboardByFc;
};

// TODO: Check if actions are correct
export const HomeDrawerFC = ({ searchResults }: HomeDrawerFCProps) => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();

  const navigateToInstallment = () => {
    const { installmentId } = searchResults;
    if (installmentId) {
      const path = generatePath(PageRoutes.DEBT_POSITION_INSTALLMENT_DETAIL, {
        id: installmentId
      });
      navigate(path);
    } else {
      navigate(PageRoutes.DEBT_POSITION_SEARCH_RESULTS);
    }
  };

  const navigateToDebtPosition = () => {
    const { debtPositionId } = searchResults;
    if (debtPositionId) {
      const path = generatePath(PageRoutes.DEBT_POSITION_DETAIL, {
        id: debtPositionId
      });
      navigate(path);
    } else {
      navigate(PageRoutes.DEBT_POSITIONS_RESULTS);
    }
  };

  const drawerItemsConfig: Array<DrawerItemConfig> = [
    {
      key: 'installment',
      icon: <ReceiptLongIcon fontSize="small" color="primary" />,
      actionIcon: 'visit',
      labelKey: searchResults.installmentId
        ? 'home.drawer.installment'
        : 'home.drawer.installments',
      shouldShow: searchResults.hasInstallment,
      onAction: navigateToInstallment
    },
    {
      key: 'debtPosition',
      icon: <DescriptionIcon fontSize="small" color="primary" />,
      actionIcon: 'visit',
      labelKey: searchResults.debtPositionId
        ? 'home.drawer.debtPosition'
        : 'home.drawer.debtPositions',
      shouldShow: searchResults.hasDebtPosition,
      onAction: navigateToDebtPosition
    }
  ];

  const visibleDrawerItems = drawerItemsConfig
    .filter((config) => config.shouldShow)
    .map((config) => (
      <HomeDrawerListItem
        key={config.key}
        actionIcon={config.actionIcon}
        actionFunction={config.onAction}
        icon={config.icon}
        label={t(config.labelKey)}
      />
    ));

  return <>{visibleDrawerItems}</>;
};
