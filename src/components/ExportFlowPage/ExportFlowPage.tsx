import { ArrowBack, CalendarToday, Dashboard, InsertDriveFile } from '@mui/icons-material';
import { Box, Button, Grid, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageRoutes } from '../../routes/routes';
import TitleComponent from '../TitleComponent/TitleComponent';
import ExportFlowContainer from '../ExportFlowContainer/ExportFlowContainer';

export const ExportFlowPage = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { category } = useParams<{category: string}>();

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
      <TitleComponent 
        title={t('exportFlow.title')}
        description={t('exportFlow.description')}
      />
      <Box
        display="flex"
        flexDirection="column"
        width="100%"
        borderRadius={0.5}
        padding={3}
        mb={3}
        sx={{ bgcolor: theme.palette.common.white }} >
        <Typography variant="h6" sx={{ mb: 1 }}>
          {t('exportFlow.formTitle')}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.primary, mb: 2 }}>
          {t('exportFlow.formDescription')}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.error.dark, mb: 4 }}>
          {t('commons.requiredFieldDescription')}
        </Typography>
        <Grid container direction="row" justifyContent={'start'} sx={{ border: 1, borderRadius: 2, padding: 3, borderColor: theme.palette.divider }}>
          <ExportFlowContainer
            title={{
              icon: <InsertDriveFile sx={{marginRight: 1}}/>,
              label: t('commons.paymentDate')
            }}
            inputFields={[
              {
                required: true,
                label: t('commons.from'),
                icon: <CalendarToday />,
                gridWidth: 6
              },
              {
                required: true,
                label: t('commons.to'),
                icon: <CalendarToday />,
                gridWidth: 6
              }
            ]}
          />
        </Grid>
        <Grid container direction="column" justifyContent={'start'} 
          sx={{ border: 1, borderRadius: 2, padding: 3, borderColor: theme.palette.divider, marginTop: 3 }}>
          <ExportFlowContainer
            title={{
              icon: <InsertDriveFile sx={{marginRight: 1}}/>,
              label: t('exportFlow.fileVersion')
            }}
            inputFields={[
              {
                required: true,
                label: t('exportFlow.fileVersion'),
                gridWidth: 12
              }
            ]}
            isSelectInput
            selectOptions={selectOptionsFileVersion}
          />
        </Grid>
        {category !== 'conservation' && (
          <Grid container direction="column" justifyContent={'start'} 
            sx={{ border: 1, borderRadius: 2, padding: 3, borderColor: theme.palette.divider, marginTop: 3 }}>
            <ExportFlowContainer
              title={{
                icon: <Dashboard sx={{marginRight: 1}} />,
                label: t('exportFlow.dueTipe')
              }}
              inputFields={[
                {
                  label: t('exportFlow.dueTipePlaceHolder'),
                  gridWidth: 12
                }
              ]}
              isSelectInput
              selectOptions={selectOptionsDueTipe}
            />
          </Grid>
        )}

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
            {t('commons.exit')}
          </Button>
        </Grid>
        <Grid item>
          <Button
            size="large"
            variant="contained"
            fullWidth
            onClick={() => navigate(PageRoutes.TELEMATIC_RECEIPT_EXPORT_FLOW_THANK_YOU_PAGE) }
          >
            {t('exportFlow.buttonConfirmReservation')}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default ExportFlowPage;
