import {
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent
} from '@mui/lab';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import { ReactNode } from 'react';
import { it } from 'date-fns/locale';

export type TimelineNode = {
  date: Date;
  element: ReactNode;
  last?: boolean;
  first?: boolean;
};

export const _TimelineElement = ({
  date,
  element,
  last,
  first
}: TimelineNode) => {
  const { day, month, time } = {
    day: format(date, 'dd', { locale: it }),
    month: format(date, 'MMM', { locale: it }).toUpperCase(),
    time: format(date, 'HH:mm', { locale: it })
  };

  return (
    <TimelineItem sx={{ alignItems: 'center', minHeight: '200px' }}>
      <TimelineOppositeContent sx={{ textAlign: 'left', flex: 0.2 }}>
        <Typography variant="body1" color="text.secondary" lineHeight="14px">
          {month}
        </Typography>
        <Typography variant="h5" component="p">
          {day}
        </Typography>
      </TimelineOppositeContent>
      <TimelineSeparator>
        {!last && (
          <TimelineConnector
            sx={{
              position: 'absolute',
              top: '60%',
              height: '80%'
            }}
          />
        )}
        <TimelineDot variant={first ? 'outlined' : 'filled'} />
      </TimelineSeparator>
      <TimelineContent sx={{ marginLeft: 3, py: 1, px: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {time}
        </Typography>
        {element}
      </TimelineContent>
    </TimelineItem>
  );
};
