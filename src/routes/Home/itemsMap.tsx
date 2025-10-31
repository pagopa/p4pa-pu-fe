import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DescriptionIcon from '@mui/icons-material/Description';
import CategoryIcon from '@mui/icons-material/Category';
import { DrawerItemConfig } from './models';
import { SearchType } from '../../models/DebtPositions';

// Configuration map for all possible drawer items
export const DRAWER_ITEMS_CONFIG: Array<DrawerItemConfig> = [
  {
    hasKey: 'hasInstallment',
    idKey: 'installmentId',
    idParamName: 'id',
    icon: <ReceiptLongIcon fontSize="small" color={'primary'} />,
    actionIcon: 'visit',
    detail: {
      route: 'DEBT_POSITION_INSTALLMENT_DETAIL',
      labelKey: 'home.drawer.installment'
    },
    list: {
      route: 'DEBT_POSITION_SEARCH_RESULTS',
      labelKey: 'home.drawer.installments',
      locationState: { searchType: SearchType.IUV },
      filterKey: 'iuv'
    }
  },
  {
    hasKey: 'hasDebtPosition',
    idKey: 'debtPositionId',
    idParamName: 'id',
    icon: <DescriptionIcon fontSize="small" color={'primary'} />,
    actionIcon: 'visit',
    detail: {
      route: 'DEBT_POSITION_DETAIL',
      labelKey: 'home.drawer.debtPosition'
    },
    list: {
      route: 'DEBT_POSITIONS_RESULTS',
      labelKey: 'home.drawer.debtPositions'
    }
  },
  {
    hasKey: 'hasReceipt',
    idKey: 'receiptId',
    idParamName: 'receiptId',
    icon: <ReceiptLongIcon fontSize="small" color={'primary'} />,
    actionIcon: 'download',
    detail: {
      route: '/receipt',
      labelKey: 'home.drawer.receipt'
    },
    list: {
      route: '/receipt',
      labelKey: 'home.drawer.receipt'
    }
  },
  {
    hasKey: 'hasIuf',
    idKey: 'iuf',
    idParamName: 'iuf',
    icon: <DescriptionIcon fontSize="small" color={'primary'} />,
    actionIcon: 'visit',
    detail: {
      route: '/iuf',
      labelKey: 'home.drawer.iuf'
    },
    list: {
      route: '/iufs',
      labelKey: 'home.drawer.iufs'
    }
  },
  {
    hasKey: 'hasClassification',
    idKey: 'classificationId',
    idParamName: 'classificationId',
    icon: <CategoryIcon fontSize="small" color={'primary'} />,
    actionIcon: 'visit',
    detail: {
      route: '/classification',
      labelKey: 'home.drawer.classification'
    },
    list: {
      route: '/classifications',
      labelKey: 'home.drawer.classifications'
    }
  },
  {
    hasKey: 'hasTreasury',
    idKey: 'treasuryId',
    idParamName: 'treasuryId',
    icon: <AccountBalanceIcon fontSize="small" color={'primary'} />,
    actionIcon: 'visit',
    detail: {
      labelKey: 'home.drawer.treasury',
      route: '/treasury'
    },
    list: {
      labelKey: 'home.drawer.treasuries',
      route: '/treasuries'
    }
  }
];
