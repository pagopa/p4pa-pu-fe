import {
  DashboardByFc,
  DashboardByIuf,
  DashboardByIuv
} from '../../../generated/data-contracts';

export enum TABS {
  IUV = 'IUV',
  IUF = 'IUF',
  FC = 'FC'
}

export type DashboardResult = DashboardByIuv & DashboardByIuf & DashboardByFc;

export type ItemConfig = {
  labelKey: string;
  route: string;
  locationState?: Record<string, string>;
  filterKey?: string;
};

export type DrawerItemConfig = {
  hasKey: keyof DashboardResult;
  idKey: keyof DashboardResult;
  idParamName?: string;
  icon: React.ReactNode;
  actionIcon: 'visit' | 'download';
  detail: ItemConfig;
  list: ItemConfig;
};

export type DrawerItem = {
  icon: React.ReactNode;
  label: string;
  actionIcon: 'visit' | 'download';
  onAction: () => void;
};
