import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const TelematicReceiptsPage = () => {
  const { t } = useTranslation('send');

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">
        {t('enterprise.send.telematicReceipts.title')}
      </Typography>

      <Button>{t('commons.actions.save')}</Button>
    </Box>
  );
};
