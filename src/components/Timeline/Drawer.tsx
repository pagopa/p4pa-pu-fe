import { Timeline as MuiTimeline } from '@mui/lab';
import { ReactNode } from 'react';
import History from '@mui/icons-material/History';
import { Drawer, DrawerProps } from '../Drawer';

export type TimelineDetailDrawerProps = DrawerProps & {
  children: ReactNode;
};

export const _TimelineDrawer = ({
  children,
  ...drawerProps
}: TimelineDetailDrawerProps) => {
  return (
    <Drawer {...drawerProps} titleDecoration={<History />}>
      <MuiTimeline sx={{ padding: 0, margin: 0 }}>{children}</MuiTimeline>
    </Drawer>
  );
};
