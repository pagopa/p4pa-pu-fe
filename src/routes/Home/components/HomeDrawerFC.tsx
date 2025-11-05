import { useTranslation } from 'react-i18next';
import { HomeDrawerListItem } from './HomeDrawerListItem';
import { useAppNavigate } from '../../../hooks/useAppNavigation';
import { generatePath } from 'react-router';
import { PageRoutes } from '../..';
import { SearchType } from '../../../models/DebtPositions';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DescriptionIcon from '@mui/icons-material/Description';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { DashboardByFc } from '../../../../generated/data-contracts';
import { DrawerItemConfig } from '../models';
import { useReceiptDownload } from '../../TelematicReceiptDetail/useReceiptDownload';

type HomeDrawerFCProps = {
  searchValue: string;
  searchResults: DashboardByFc;
};

export const HomeDrawerFC = ({
  searchValue,
  searchResults
}: HomeDrawerFCProps) => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const { downloadReceipt } = useReceiptDownload();

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
      navigate(path, { hashObject: { fiscalCode: searchValue } });
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
      navigate(PageRoutes.DEBT_POSITIONS_RESULTS, {
        hashObject: { fiscalCode: searchValue }
      });
    }
  };

  const navigateOrDownloadReceipt = () => {
    const { receiptId } = searchResults;
    if (receiptId) {
      downloadReceipt({ receiptId });
    } else {
      navigate(PageRoutes.TELEMATIC_RECEIPT_SEARCH_RESULTS, {
        hashObject: { fiscalCode: searchValue }
      });
    }
  };

  // Classification action not available in DashboardByFc type; omitted to avoid unsafe typing

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
      icon: <DescriptionOutlinedIcon fontSize="small" color="primary" />,
      actionIcon: searchResults.receiptId ? 'download' : 'visit',
      labelKey: searchResults.receiptId
        ? 'home.drawer.receipt'
        : 'home.drawer.receipts',
      shouldShow: searchResults.hasReceipt,
      onAction: navigateOrDownloadReceipt
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
