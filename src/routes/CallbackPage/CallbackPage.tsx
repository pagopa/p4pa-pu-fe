import React from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { theme } from '@pagopa/mui-italia';

type CallbackType = 'ok' | 'ko' | 'cancel';

type CallbackConfig = {
  title: string;
  description?: string;
  icon: React.ReactNode;
};

const CallbackPage = () => {
  const { outcome } = useParams<{ outcome: string }>();
  const { t } = useTranslation();

  const getCallbackType = (): CallbackType => {
    if (outcome === 'ok') return 'ok';
    if (outcome === 'ko') return 'ko';
    if (outcome === 'cancel') return 'cancel';
    return 'ko';
  };

  const getCallbackConfig = (type: CallbackType): CallbackConfig => {
    const configs: Record<CallbackType, CallbackConfig> = {
      ok: {
        title: t('callback.success.title'),
        description: t('callback.success.description'),
        icon: (
          <CheckCircleOutlineOutlinedIcon
            sx={{ fontSize: 60, color: theme.palette.secondary.main }}
          />
        )
      },
      ko: {
        title: t('callback.error.title'),
        description: t('callback.error.description'),
        icon: (
          <ErrorOutlineIcon
            sx={{ fontSize: 60, color: theme.palette.error.main }}
          />
        )
      },
      cancel: {
        title: t('callback.cancel.title'),
        description: t('callback.cancel.description'),
        icon: (
          <WarningAmberOutlinedIcon
            sx={{ fontSize: 60, color: theme.palette.warning.main }}
          />
        )
      }
    };

    return configs[type];
  };

  const callbackType = getCallbackType();
  const config = getCallbackConfig(callbackType);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: 3,
        textAlign: 'center'
      }}
    >
      <Box sx={{ marginBottom: 3 }}>{config.icon}</Box>

      <TitleComponent
        title={config.title}
        description={config.description}
        variant="h2"
        accessibleTitle={config.title}
        dataTestId={`callback-page-${callbackType}`}
        sx={{
          textAlign: 'center',
          marginBottom: 2
        }}
      />
    </Box>
  );
};

export default CallbackPage;
