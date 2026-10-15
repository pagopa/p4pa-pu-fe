import { ReactNode, useId } from 'react';
import {
  TypographyProps,
  Stack,
  Typography,
  Tooltip,
  Paper,
  Button
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTranslation } from 'react-i18next';
import { I18N_PREFIX } from '..';

export const Field = ({
  label,
  width,
  variant = 'body2',
  children
}: {
  label: string;
  width?: string;
  variant?: TypographyProps['variant'];
  children: ReactNode;
}) => (
  <Stack sx={{ flex: width ? `0 0 ${width}` : '0 1 auto', minWidth: 0 }}>
    <Typography component="dt" variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Tooltip
      title={typeof children == 'string' ? children : ''}
      placement="top-start"
    >
      <Typography
        component="dd"
        variant={variant}
        fontWeight={variant === 'body2' ? 600 : undefined}
        noWrap
        sx={{ m: 0 }}
      >
        {children}
      </Typography>
    </Tooltip>
  </Stack>
);

export const Row = ({
  name,
  onShow,
  children
}: {
  name: string;
  onShow: () => void;
  children: ReactNode;
}) => {
  const { t } = useTranslation(undefined, I18N_PREFIX);
  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" gap={10}>
        <Stack
          component="dl"
          direction="row"
          justifyContent="space-between"
          gap={2}
          sx={{ flex: 1, minWidth: 0, m: 0 }}
        >
          {children}
        </Stack>
        <Button
          variant="text"
          endIcon={<ArrowForwardIcon />}
          aria-label={t('showItem', { name })}
          onClick={onShow}
        >
          {t('show')}
        </Button>
      </Stack>
    </Paper>
  );
};

export const Section = ({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) => {
  const headingId = useId();
  return (
    <Stack component="section" aria-labelledby={headingId} gap={2}>
      <Typography id={headingId} variant="h5" component="h2">
        {title}
      </Typography>
      {children}
    </Stack>
  );
};
