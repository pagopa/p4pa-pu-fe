import { Box, Button, Grid, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import { ArrowForwardIos, CalendarToday, Downloading, Search } from '@mui/icons-material';
import { ButtonNaked } from '@pagopa/mui-italia';
import FlowDataGrid from '../../components/FlowDataGrid/FlowDataGrid';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { BackButton } from '../BackButton';
import { useTranslation } from 'react-i18next';

const TelematicReceiptFlowExportOverview = () => {
    const theme = useTheme();
    const { t } = useTranslation();

    const breadcrumbs = {
        elements: [
            { name: 'flows', fontWeight: 600, color: theme.palette.text.primary },
            { name: 'telematicreceipt', color: theme.palette.text.primary },
            { name: 'telematicReceiptFlowExportOverview', color: theme.palette.text.disabled }
        ]
    };

    return (
        <>
            <Grid container direction={'row'}>
                <Grid item alignContent={'center'}>
                    <BackButton />
                </Grid>
                <Grid item alignContent={'center'} marginTop={0.5} marginLeft={2.5}>
                    <Breadcrumbs separator={<ArrowForwardIos sx={{ fontSize: '0.75rem' }} />} crumbs={breadcrumbs} />
                </Grid>
            </Grid>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 2
                }}
            >
                <Typography variant="h3">
                    {t('telematicReceiptFlowExportOverview.title')}
                </Typography>
                <Button
                    size="large"
                    startIcon={<Downloading />}
                    variant="outlined">
                    {t('telematicReceiptFlowExportOverview.buttonReservationExport')}
                </Button>
            </Box>

            <Typography variant="body1" sx={{ marginBottom: 2 }}>
                {t('telematicReceiptFlowExportOverview.description')}
            </Typography>
            <Grid container direction="row" spacing={2}
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
                        label={t('telematicReceiptFlowExportOverview.from')}
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
                        label={t('telematicReceiptFlowExportOverview.to')}
                    />
                </Grid>
                <Grid item lg={1}>
                    <Button
                        fullWidth
                        size="medium"
                        variant="contained"
                        sx={{height: 40}}>
                        {t('telematicReceiptFlowExportOverview.filter')}
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
                        {t('telematicReceiptFlowExportOverview.removeFilter')}
                    </ButtonNaked>
                </Grid>
            </Grid>
            <Box
                sx={{
                    borderColor: theme.palette.grey[200],
                    borderWidth: 20,
                    borderStyle: 'solid'
                }}
            >
                <FlowDataGrid />
            </Box>
        </>
    );
};

export default TelematicReceiptFlowExportOverview;