import { format } from 'date-fns/format';
import { it } from 'date-fns/locale';
import { Stack, Typography, Divider } from '@mui/material';
import { InstitutionIcon } from '../../assets/icons/institution';
import { QuestionIcon } from '../../assets/icons/question';
import { ReceiptIcon } from '../../assets/icons/receipt';
import { BackIcon } from '../../assets/icons/back';
import { useTranslation } from 'react-i18next';
import { MarkdownPreview } from '../MarkdownPreview';

type NotificationPreviewProps = {
  title?: string;
  message?: string;
};

export const NotificationPreview = ({
  message,
  title
}: NotificationPreviewProps) => {
  const { t } = useTranslation();
  return (
    <Stack gap={2}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <BackIcon />
        <Stack direction="row" spacing={2}>
          <ReceiptIcon />
          <QuestionIcon />
        </Stack>
      </Stack>

      {/* Meta Info */}
      <Stack>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          {format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: it })}
        </Typography>
      </Stack>

      <Divider />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack>
          <Typography variant="caption" color="text.secondary">
            {t('notificationPreview.byOrg')}
          </Typography>
          <br />
          <Typography color="primary.main" variant="body2" fontWeight={600}>
            {t('notificationPreview.byService')}
          </Typography>
        </Stack>
        <Stack
          sx={{ border: '1px solid #E0E0E0', borderRadius: 2, padding: 1.2 }}
        >
          <InstitutionIcon />
        </Stack>
      </Stack>
      <Divider />

      {/* Message Body */}
      <Stack mt={-2}>
        <MarkdownPreview message={message} />
      </Stack>
    </Stack>
  );
};
