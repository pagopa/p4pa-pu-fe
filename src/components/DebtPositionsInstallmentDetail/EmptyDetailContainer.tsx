import { Card, CardContent, Typography, useTheme } from '@mui/material';
import { Category } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const EmptyDetailContainer = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Card sx={{ backgroundColor: theme.palette.divider, borderRadius: 2, height: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CardContent sx={{ textAlign: 'center' }}>
        <Category sx={{color: theme.palette.text.secondary}} />
        <Typography variant="body1" color={theme.palette.text.secondary} sx={{ mt: 1 }}>
          {t('installmentDetailPage.noPaymentMade')}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default EmptyDetailContainer;
