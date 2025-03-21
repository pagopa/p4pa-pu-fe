import {
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  Timeline,
  TimelineOppositeContent
} from '@mui/lab';
import { Drawer, DrawerProps } from '../../../components/Drawer';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import { ReactNode } from 'react';
import { it } from 'date-fns/locale';
import Stack from '@mui/material/Stack';

export type TimelineNode = {
  date: Date;
  element: ReactNode;
  last?: boolean;
  first?: boolean;
};

export type TimelineDetailDrawerProps = DrawerProps & {
  nodes: Array<TimelineNode>;
};

const TimelineElement = ({ date, element, last, first }: TimelineNode) => {
  const { day, month, time } = {
    day: format(date, 'dd', { locale: it }),
    month: format(date, 'MMM', { locale: it }).toUpperCase(),
    time: format(date, 'HH:mm', { locale: it })
  };

  const DateNode = () => (
    <Stack
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        flex: 0,
        p: 0
      }}
    >
      <Typography variant="body1">{month}</Typography>
      <Typography variant="h5" component="p">
        {day}
      </Typography>
    </Stack>
  );

  const ElementNode = () => (
    <Stack sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="caption">{time}</Typography>
      {element}
    </Stack>
  );

  return (
    <TimelineItem sx={{ alignItems: 'center', padding: 0, gap: 4 }}>
      <TimelineOppositeContent sx={{ textAlign: 'left', flex: 0, padding: 0 }}>
        <DateNode />
      </TimelineOppositeContent>
      <TimelineSeparator sx={{ pl: 2 }}>
        {!last && (
          <TimelineConnector
            sx={{ position: 'absolute', height: '85px', top: '70px' }}
          />
        )}
        <TimelineDot variant={first ? 'outlined' : 'filled'} />
      </TimelineSeparator>
      <TimelineContent>
        <ElementNode />
      </TimelineContent>
    </TimelineItem>
  );
};

export const TimelineDrawer = ({
  nodes,
  ...drawerProps
}: TimelineDetailDrawerProps) => {
  return (
    <Drawer {...drawerProps}>
      <Timeline sx={{ padding: 0 }}>
        {nodes.map((node, index) => (
          <TimelineElement key={`${node.date}-${index}`} {...node} />
        ))}
      </Timeline>
    </Drawer>
  );
};
