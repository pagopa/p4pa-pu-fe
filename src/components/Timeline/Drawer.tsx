import { Timeline as MuiTimeline } from '@mui/lab';
import type { ReactNode } from 'react';
import History from '@mui/icons-material/History';
import type { DrawerProps } from '../Drawer';
import { Drawer } from '../Drawer';

export type TimelineDetailDrawerProps = DrawerProps & {
  children: ReactNode;
};

export const _TimelineDrawer = ({
  children,
  ...drawerProps
}: TimelineDetailDrawerProps) => {
  return (
    <Drawer
      {...drawerProps}
      titleDecoration={<History />}
      data-testid="timeline-drawer"
    >
      <MuiTimeline sx={{ padding: 0, margin: 0 }}>{children}</MuiTimeline>
    </Drawer>
  );
};
