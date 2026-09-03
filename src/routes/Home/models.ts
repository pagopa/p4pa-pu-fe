import {
  DashboardByFc,
  DashboardByIuf,
  DashboardByIuv
} from '../../../generated/core/data-contracts';
import { ReactElement, ReactNode } from 'react';

export enum TABS {
  IUV = 'IUV',
  IUF = 'IUF',
  FC = 'FC'
}

export type tabsConfigProps = {
  id: TABS;
  label: string;
  icon: ReactElement;
  searchLabel: string;
  searchName: string;
};

export enum USER_PROFILES {
  DP = 'debtpositionsManager',
  TM = 'treasuriesManager',
  OM = 'officeManager'
}

export type tabsPerProfile = Record<USER_PROFILES, Array<TABS>>;

export type DashboardResult = DashboardByIuv & DashboardByIuf & DashboardByFc;

export type DrawerItemConfig = {
  key: string;
  icon: ReactNode;
  actionIcon: 'visit' | 'download';
  labelKey: string;
  shouldShow?: boolean;
  onAction: () => void;
};
