import { Timeline as MuiTimeline } from '@mui/lab';
import { Drawer, DrawerProps } from '../../../components/Drawer';
import { ReactNode } from 'react';
import History from '@mui/icons-material/History';
import { TimelineElement } from '../../../components/TimelineNode';

export type TimelineDetailDrawerProps = DrawerProps & {
  children: ReactNode;
};

export const TimelineDrawer = ({
  children,
  ...drawerProps
}: TimelineDetailDrawerProps) => {
  return (
    <Drawer {...drawerProps} titleDecoration={<History />}>
      <MuiTimeline sx={{ padding: 0, margin: 0 }}>{children}</MuiTimeline>
    </Drawer>
  );
};

export const Timeline = {
  Element: TimelineElement
};
