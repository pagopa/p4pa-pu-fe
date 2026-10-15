import ContentCopyIcon from '@mui/icons-material/ContentCopyOutlined';
import { IconButton, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { copyWithFeedback } from '@core/utils/clipboard';

type CopiableFieldProps = {
  label: string;
  value: string;
  copyLabel?: string;
  labelPrefix?: string;
};

export const CopiableField = ({
  label,
  value,
  labelPrefix = 'commons.copy_female'
}: CopiableFieldProps) => {
  const { t } = useTranslation();

  const copy = (value: string, label: string) => {
    copyWithFeedback(value, `${label} ${t('commons.copied')}`);
  };

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      gap={1}
    >
      <Stack>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography
          variant="body1"
          fontWeight={600}
          color={'primary.dark'}
          sx={{ wordBreak: 'break-all' }}
        >
          {value}
        </Typography>
      </Stack>
      <IconButton
        size="small"
        aria-label={t(labelPrefix, { label })}
        onClick={() => copy(value, label)}
      >
        <ContentCopyIcon fontSize="small" color="primary" />
      </IconButton>
    </Stack>
  );
};
