import React from 'react';
import { Box, Typography, Alert, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ClassificationDetailDTO } from '../../../generated/data-contracts';
import { CheckBox, DisabledByDefault } from '@mui/icons-material';
import { useClassificationAlert } from './hooks/useClassificationAlert';

type StatusBarProps = {
  classificationData: ClassificationDetailDTO;
};

type ReconciliationState = {
  icon: React.ReactNode;
  label: string;
  description: string;
  isActive: boolean;
};

export const StatusBar: React.FC<StatusBarProps> = ({ classificationData }) => {
  const { t } = useTranslation();
  const alertInfo = useClassificationAlert(classificationData);

  const reconciliationStates: Array<ReconciliationState> = [
    {
      icon: classificationData.payed ? (
        <CheckBox sx={{ color: 'success.main', fontSize: 20 }} />
      ) : (
        <DisabledByDefault sx={{ color: 'error.main', fontSize: 20 }} />
      ),
      label: t('classifications.detail.statusBar.status.states.paid.label'),
      description: classificationData.payed
        ? t(
            'classifications.detail.statusBar.status.states.paid.descriptionActive'
          )
        : t(
            'classifications.detail.statusBar.status.states.paid.descriptionInactive'
          ),
      isActive: Boolean(classificationData.payed)
    },
    {
      icon: classificationData.reported ? (
        <CheckBox sx={{ color: 'success.main', fontSize: 20 }} />
      ) : (
        <DisabledByDefault sx={{ color: 'error.main', fontSize: 20 }} />
      ),
      label: t('classifications.detail.statusBar.status.states.reported.label'),
      description: classificationData.reported
        ? t(
            'classifications.detail.statusBar.status.states.reported.descriptionActive'
          )
        : t(
            'classifications.detail.statusBar.status.states.reported.descriptionInactive'
          ),
      isActive: Boolean(classificationData.reported)
    },
    // collected section is visible only if flagTreasury is true
    ...(classificationData.flagTreasury
      ? [
          {
            icon: classificationData.collected ? (
              <CheckBox sx={{ color: 'success.main', fontSize: 20 }} />
            ) : (
              <DisabledByDefault sx={{ color: 'error.main', fontSize: 20 }} />
            ),
            label: t(
              'classifications.detail.statusBar.status.states.collected.label'
            ),
            description: classificationData.collected
              ? t(
                  'classifications.detail.statusBar.status.states.collected.descriptionActive'
                )
              : t(
                  'classifications.detail.statusBar.status.states.collected.descriptionInactive'
                ),
            isActive: Boolean(classificationData.collected)
          }
        ]
      : [])
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Alert severity={alertInfo.severity} variant="outlined" sx={{ mb: 3 }}>
        <Typography
          variant="caption-semibold"
          component="div"
          sx={{ fontWeight: 600, mb: 0.5 }}
        >
          {t(alertInfo.titleKey)}
        </Typography>
        <Typography variant="body2">{t(alertInfo.descriptionKey)}</Typography>
      </Alert>

      <Box
        sx={{
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography
          variant="overline"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            textTransform: 'uppercase'
          }}
        >
          {t(
            'classifications.detail.statusBar.status.reconciliationState.title'
          )}
        </Typography>
        <Stack direction="row" spacing={4} mt={3}>
          {reconciliationStates.map((state, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flex: 1
              }}
            >
              {state.icon}
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 0.5
                  }}
                >
                  {state.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.primary',
                    fontSize: '0.8rem'
                  }}
                >
                  {state.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};
