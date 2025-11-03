import { useTranslation } from 'react-i18next';
import { HomeDrawerListItem } from './HomeDrawerListItem';
import { useAppNavigate } from '../../../hooks/useAppNavigation';
import { generatePath } from 'react-router';
import { PageRoutes } from '../..';
import { SearchType } from '../../../models/DebtPositions';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CategoryIcon from '@mui/icons-material/Category';
import { DashboardByIuv } from '../../../../generated/data-contracts';
import { DrawerItemConfig } from '../models';

type HomeDrawerIUVProps = {
  searchValue: string;
  searchResults?: DashboardByIuv;
};

export const HomeDrawerIUV = ({
  searchValue,
  searchResults
}: HomeDrawerIUVProps) => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();

  if (!searchResults) return null;

  const navigateToInstallment = () => {
    const { installmentId } = searchResults;
    if (installmentId) {
      const path = generatePath(PageRoutes.DEBT_POSITION_INSTALLMENT_DETAIL, {
        id: installmentId
      });
      navigate(path);
    } else {
      const path = generatePath(PageRoutes.DEBT_POSITION_SEARCH_RESULTS, {
        state: { searchType: SearchType.IUV }
      });
      navigate(path, { hashObject: { iuv: searchValue } });
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
      const path = generatePath(PageRoutes.DEBT_POSITIONS_RESULTS);
      navigate(path, { hashObject: { iuv: searchValue } });
    }
  };

  const navigateToReceipt = () => {
    const { receiptId } = searchResults;
    const path = '/receipt';
    if (receiptId) {
      navigate(generatePath(path, { receiptId }));
    } else {
      navigate(path);
    }
  };

  const navigateToClassification = () => {
    const { classificationId } = searchResults;
    if (classificationId) {
      navigate(generatePath('/classification', { classificationId }));
    } else {
      navigate('/classifications');
    }
  };

  const navigateToTreasury = () => {
    const { iuf } = searchResults;
    if (iuf) {
      navigate(generatePath('/treasury', { treasuryId: iuf }));
    } else {
      navigate('/treasuries');
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
    },
    {
      key: 'receipt',
      icon: <ReceiptLongIcon fontSize="small" color="primary" />,
      actionIcon: 'download',
      labelKey: 'home.drawer.receipt',
      shouldShow: searchResults.hasReceipt,
      onAction: navigateToReceipt
    },
    {
      key: 'classification',
      icon: <CategoryIcon fontSize="small" color="primary" />,
      actionIcon: 'visit',
      labelKey: searchResults.classificationId
        ? 'home.drawer.classification'
        : 'home.drawer.classifications',
      shouldShow: searchResults.hasClassification,
      onAction: navigateToClassification
    },
    {
      key: 'treasury',
      icon: <AccountBalanceIcon fontSize="small" color="primary" />,
      actionIcon: 'visit',
      labelKey: searchResults.iuf
        ? 'home.drawer.treasury'
        : 'home.drawer.treasuries',
      shouldShow: searchResults.hasIuf,
      onAction: navigateToTreasury
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
