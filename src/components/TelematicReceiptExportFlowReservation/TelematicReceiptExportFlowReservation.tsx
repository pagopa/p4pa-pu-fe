import { ArrowBack, CalendarToday, Dashboard, InsertDriveFile } from '@mui/icons-material';
import { Box, Button, Grid, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TelematicReceiptExportFlowReservationContainer from './TelematicReceiptExportFlowReservationContainer';
import { useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../routes/routes';

export const TelematicReceiptExportFlowReservation = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const selectOptionsFileVersion = [
    { label: 'version1', value: 'version1' },
    { label: 'version2', value: 'version2' },
    { label: 'version3', value: 'version3' }
  ];

  const selectOptionsDueTipe = [
    { label: 'test1', value: 'test1' },
    { label: 'test12', value: 'test12' },
    { label: 'test123', value: 'test123' }
  ];

  return (
    <>
      <Grid container direction="column">
        <Grid item mb={2}>
          <Typography variant="h3" >
            {t('telematicReceiptExportFlowReservation.title')}
          </Typography>
        </Grid>
        <Grid item mb={3}>
          <Typography variant="body1">
            {t('telematicReceiptExportFlowReservation.description')}
          </Typography>
        </Grid>
      </Grid>
      <Box
        display="flex"
        flexDirection="column"
        width="100%"
        borderRadius={0.5}
        padding={3}
        mb={3}
        sx={{ bgcolor: theme.palette.common.white }} >
        <Typography variant="h6" sx={{ mb: 1 }}>
          {t('telematicReceiptExportFlowReservation.formTitle')}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.primary, mb: 2 }}>
          {t('telematicReceiptExportFlowReservation.formDescription')}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.error.dark, mb: 4 }}>
          {t('telematicReceiptExportFlowReservation.requiredFieldDescription')}
        </Typography>
        <Grid container direction="row" justifyContent={'start'} sx={{ border: 1, borderRadius: 2, padding: 3, borderColor: theme.palette.divider }}>
          <TelematicReceiptExportFlowReservationContainer
            title={{
              icon: <InsertDriveFile sx={{marginRight: 1}}/>,
              label: t('telematicReceiptExportFlowReservation.paymentDate')
            }}
            inputFields={[
              {
                required: true,
                label: t('telematicReceiptExportFlowReservation.from'),
                icon: <CalendarToday />,
                gridWidth: 6
              },
              {
                required: true,
                label: t('telematicReceiptExportFlowReservation.to'),
                icon: <CalendarToday />,
                gridWidth: 6
              }
            ]}
          />
        </Grid>
        <Grid container direction="column" justifyContent={'start'} 
          sx={{ border: 1, borderRadius: 2, padding: 3, borderColor: theme.palette.divider, marginTop: 3 }}>
          <TelematicReceiptExportFlowReservationContainer
            title={{
              icon: <InsertDriveFile sx={{marginRight: 1}}/>,
              label: t('telematicReceiptExportFlowReservation.fileVersion')
            }}
            inputFields={[
              {
                required: true,
                label: t('telematicReceiptExportFlowReservation.fileVersion'),
                gridWidth: 12
              }
            ]}
            isSelectInput
            selectOptions={selectOptionsFileVersion}
          />
        </Grid>
        <Grid container direction="column" justifyContent={'start'} 
          sx={{ border: 1, borderRadius: 2, padding: 3, borderColor: theme.palette.divider, marginTop: 3 }}>
          <TelematicReceiptExportFlowReservationContainer
            title={{
              icon: <Dashboard sx={{marginRight: 1}} />,
              label: t('telematicReceiptExportFlowReservation.dueTipe')
            }}
            inputFields={[
              {
                label: t('telematicReceiptExportFlowReservation.dueTipePlaceHolder'),
                gridWidth: 12
              }
            ]}
            isSelectInput
            selectOptions={selectOptionsDueTipe}
          />
        </Grid>
      </Box>
      <Grid container direction={'row'} justifyContent={'space-between'}>
        <Grid item>
          <Button
            size="large"
            variant="outlined"
            fullWidth
            startIcon={<ArrowBack />} 
            onClick={() => navigate(PageRoutes.TELEMATIC_RECEIPT_EXPORT_OVERVIEW) }
          >
            {t('telematicReceiptExportFlowReservation.buttonExit')}
          </Button>
        </Grid>
        <Grid item>
          <Button
            size="large"
            variant="contained"
            fullWidth
            onClick={() => navigate(PageRoutes.TELEMATIC_RECEIPT_EXPORT_FLOW_THANK_YOU_PAGE) }
          >
            {t('telematicReceiptExportFlowReservation.buttonConfirmReservation')}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default TelematicReceiptExportFlowReservation;