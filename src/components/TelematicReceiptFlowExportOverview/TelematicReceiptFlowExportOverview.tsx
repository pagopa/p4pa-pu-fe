import { Box, Button, Grid, InputAdornment, TextField, useTheme } from '@mui/material';
import { CalendarToday, Downloading, Search } from '@mui/icons-material';
import { ButtonNaked } from '@pagopa/mui-italia';
import FlowDataGrid from '../../components/FlowDataGrid/FlowDataGrid';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../routes/routes';
import TitleComponent from '../TitleComponent/TitleComponent';

const TelematicReceiptFlowExportOverview = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <Box sx={{ flex: 1, position: 'relative' }}>
        <Box sx={{ position: 'absolute', inset: 0 }}>
          <TitleComponent 
            title= {t('commons.routes.TELEMATIC_RECEIPT_EXPORT_OVERVIEW')} 
            callToAction={
              [
                {
                  icon: <Downloading />, 
                  variant: 'outlined', 
                  buttonText: t('telematicReceiptFlowExportOverview.buttonReservationExport'), 
                  onActionClick: () => navigate(PageRoutes.TELEMATIC_RECEIPT_EXPORT_FLOW_RESERVATION)
                },
              ]
            } 
            description= {t('telematicReceiptFlowExportOverview.description')}
          />
          <Grid container direction="row" spacing={2} mt={2}
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 2
            }}>
            <Grid item lg={5}>
              <TextField
                sx={{ bgcolor: theme.palette.common.white }}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
                }}
                label={t('telematicReceiptFlowExportOverview.searchFlowName')}
              />
            </Grid>
            <Grid item lg={2}>
              <TextField
                sx={{ bgcolor: theme.palette.common.white }}
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end"><CalendarToday /></InputAdornment>
                }}
                label={t('commons.from')}
              />
            </Grid>
            <Grid item lg={2}>
              <TextField
                sx={{ bgcolor: theme.palette.common.white }}
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end"><CalendarToday /></InputAdornment>
                }}
                label={t('commons.to')}
              />
            </Grid>
            <Grid item lg={1}>
              <Button
                fullWidth
                size="medium"
                variant="contained"
                sx={{height: 40}}>
                {t('commons.filters.filterResults')}
              </Button>
            </Grid>
            <Grid item lg={2}
              display={'flex'}
              justifyContent={'center'}
              alignContent={'center'} 
            >
              <ButtonNaked
                fullWidth
                color='text'
                weight='default'
                size='small'
                onFocusVisible={function noRefCheck() { }}
              >
                {t('commons.filters.remove')}
              </ButtonNaked>
            </Grid>
          </Grid>
          <Box
            sx={{
              bgcolor: theme.palette.grey[200],
              padding: 2
            }}
          >
            <FlowDataGrid />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default TelematicReceiptFlowExportOverview;
