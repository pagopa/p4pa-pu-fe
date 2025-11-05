import {
  DashboardByFc,
  DashboardByIuf,
  DashboardByIuv
} from '../../../generated/data-contracts';
import { ReactNode } from 'react';

export enum TABS {
  IUV = 'IUV',
  IUF = 'IUF',
  FC = 'FC'
}

export type DashboardResult = DashboardByIuv & DashboardByIuf & DashboardByFc;

export type DrawerItemConfig = {
  key: string;
  icon: ReactNode;
  actionIcon: 'visit' | 'download';
  labelKey: string;
  shouldShow?: boolean;
  onAction: () => void;
};
