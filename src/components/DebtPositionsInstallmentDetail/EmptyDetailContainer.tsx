import { useTranslation } from 'react-i18next';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import type CardOwnProps from '@mui/material/CardOwnProps';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import Category from '@mui/icons-material/Category';

type EmptyDetailContainerProps = {
  sx?: CardOwnProps['sx'];
  description?: string;
};

const EmptyDetailContainer = (props: EmptyDetailContainerProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Card
      sx={{
        backgroundColor: theme.palette.divider,
        borderRadius: 2,
        height: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...props.sx
      }}
    >
      <CardContent sx={{ textAlign: 'center' }}>
        <Category sx={{ color: theme.palette.text.secondary }} />
        <Typography
          variant="body1"
          color={theme.palette.text.secondary}
          sx={{ mt: 1 }}
        >
          {props.description || t('commons.noPaymentMade')}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default EmptyDetailContainer;
