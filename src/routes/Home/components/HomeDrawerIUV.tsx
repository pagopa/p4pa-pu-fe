import { useTranslation } from 'react-i18next';
import { HomeDrawerListItem } from './HomeDrawerListItem';
import { useAppNavigate } from '../../../hooks/useAppNavigation';
import { generatePath } from 'react-router';
import { PageRoutes } from '../..';
import { SearchType } from '../../../models/DebtPositions';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import { DashboardByIuv } from '../../../../generated/core/data-contracts';
import { DrawerItemConfig } from '../models';
import { useReceiptDownload } from '../../TelematicReceiptDetail/useReceiptDownload';

type HomeDrawerIUVProps = {
  searchValue: string;
  searchResults: DashboardByIuv;
};

export const HomeDrawerIUV = ({
  searchValue,
  searchResults
}: HomeDrawerIUVProps) => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();
  const { downloadReceipt } = useReceiptDownload();

  const installmentAction = () => {
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

  const debtPositionAction = () => {
    const { debtPositionId } = searchResults;
    if (debtPositionId) {
      const path = generatePath(PageRoutes.DEBT_POSITION_DETAIL, {
        id: debtPositionId
      });
      navigate(path);
    } else {
      navigate(PageRoutes.DEBT_POSITIONS_RESULTS, {
        hashObject: { iuv: searchValue }
      });
    }
  };

  const receiptAction = () => {
    const { receiptId } = searchResults;
    if (receiptId) {
      downloadReceipt({ receiptId });
    } else {
      navigate(PageRoutes.TELEMATIC_RECEIPT_SEARCH_RESULTS, {
        hashObject: { iuv: searchValue }
      });
    }
  };

  const classificationAction = () => {
    const { classificationId } = searchResults;
    if (classificationId) {
      const path = generatePath(PageRoutes.CLASSIFICATION_DETAIL, {
        classificationId
      });
      navigate(generatePath(path));
    } else {
      const path = PageRoutes.CLASSIFICATIONS_SEARCH_RESULTS;
      navigate(path, { hashObject: { iuv: searchValue } });
    }
  };

  const reportingAction = () => {
    const { iuf } = searchResults;
    if (iuf) {
      const path = generatePath(PageRoutes.REPORTING_DETAIL, { id: iuf });
      navigate(path);
    } else {
      navigate(PageRoutes.REPORTING_SEARCH_RESULTS, {
        hashObject: { iuv: searchValue }
      });
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
      onAction: installmentAction
    },
    {
      key: 'debtPosition',
      icon: <ReceiptLongIcon fontSize="small" color="primary" />,
      actionIcon: 'visit',
      labelKey: searchResults.debtPositionId
        ? 'home.drawer.debtPosition'
        : 'home.drawer.debtPositions',
      shouldShow: searchResults.hasDebtPosition,
      onAction: debtPositionAction
    },
    {
      key: 'receipt',
      icon: <DescriptionOutlinedIcon fontSize="small" color="primary" />,
      actionIcon: 'download',
      labelKey: 'home.drawer.receipt',
      shouldShow: searchResults.hasReceipt,
      onAction: receiptAction
    },
    {
      key: 'reporting',
      icon: (
        <AltRouteIcon
          fontSize="small"
          color="primary"
          sx={{ transform: 'rotate(90deg)' }}
        />
      ),
      actionIcon: 'visit',
      labelKey: searchResults.iuf
        ? 'home.drawer.reporting'
        : 'home.drawer.reportings',
      shouldShow: searchResults.hasIuf,
      onAction: reportingAction
    },
    {
      key: 'classification',
      icon: <PlaylistAddCheckIcon fontSize="small" color="primary" />,
      actionIcon: 'visit',
      labelKey: searchResults.classificationId
        ? 'home.drawer.classification'
        : 'home.drawer.classifications',
      shouldShow: searchResults.hasClassification,
      onAction: classificationAction
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
