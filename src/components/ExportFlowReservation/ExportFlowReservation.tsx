import { ArrowBack, CalendarToday, Dashboard, InsertDriveFile } from '@mui/icons-material';
import { Box, Button, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography, useTheme } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const ExportFlowReservation = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [selectedValueFileVersion, setSelectedValueFileVersion] = React.useState('');
  const [selectedValueDueTipe, setSelectedValueDueTipe] = React.useState('');

  const selectOptionsFileVersion = [
    { label: 'test1', value: 'test1' },
    { label: 'test12', value: 'test12' },
    { label: 'test123', value: 'test123' }
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
            {t('exportFlowReservation.title')}
          </Typography>
        </Grid>
        <Grid item mb={3}>
          <Typography variant="body1">
            {t('exportFlowReservation.description')}
          </Typography>
        </Grid>
      </Grid>

      <Box
        display="flex"
        flexDirection="column"
        width="100%"
        padding={3}
        mb={3}
        sx={{ bgcolor: theme.palette.common.white }} >
        <Typography variant="h6" sx={{ mb: 1 }}>
          {t('exportFlowReservation.formTitle')}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.primary, mb: 4 }}>
          {t('exportFlowReservation.formDescription')}
        </Typography>
        <Grid container direction="column" justifyContent={'start'} sx={{ border: 1, borderRadius: 2, padding: 3, borderColor: theme.palette.divider }}>
          <Grid item lg={12}>
            <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary, display: 'flex', alignItems: 'center', mb: 2 }}>
              <InsertDriveFile sx={{marginRight: 1}}/>
              {t('exportFlowReservation.paymentDate')}
            </Typography>
          </Grid>
          <Grid container spacing={2}>
            <Grid item lg={6}>
              <TextField
                required
                sx={{ bgcolor: theme.palette.common.white }}
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end"><CalendarToday /></InputAdornment>
                }}
                label={t('exportFlowReservation.from')}
              />
            </Grid>
            <Grid item lg={6}>
              <TextField
                required
                sx={{ bgcolor: theme.palette.common.white }}
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end"><CalendarToday /></InputAdornment>
                }}
                label={t('exportFlowReservation.to')}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid container direction="column" justifyContent={'start'} 
          sx={{ border: 1, borderRadius: 2, padding: 3, borderColor: theme.palette.divider, marginTop: 3 }}>
          <Grid item lg={12}>
            <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary, display: 'flex', alignItems: 'center', mb: 2 }}>
              <InsertDriveFile sx={{marginRight: 1}} />
              {t('exportFlowReservation.fileVersion')}
            </Typography>
          </Grid>
          <Grid container>
            <Grid item lg={12}>
              <FormControl
                fullWidth
                size="small"
                role="combobox"
                aria-labelledby="due-type-label"
              >
                <InputLabel required id="due-type-label">{t('exportFlowReservation.fileVersion')}</InputLabel>
                <Select
                  fullWidth
                  required
                  labelId="due-type-label"
                  value={selectedValueFileVersion}
                  onChange={(event) => setSelectedValueFileVersion(event.target.value)}
                  label={t('exportFlowReservation.fileVersion')}
                >
                  {selectOptionsFileVersion.map((option, index) => (
                    <MenuItem key={index} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
        <Grid container direction="column" justifyContent={'start'} 
          sx={{ border: 1, borderRadius: 2, padding: 3, borderColor: theme.palette.divider, marginTop: 3 }}>
          <Grid item lg={12} mb={1}>
            <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary, display: 'flex', alignItems: 'center', mb: 2 }}>
              <Dashboard sx={{marginRight: 1}} />
              {t('exportFlowReservation.dueTipe')}
            </Typography>
          </Grid>
          <Grid container>
            <Grid item lg={12}>
              <FormControl
                fullWidth
                size="small"
                role="combobox"
                aria-labelledby="due-type-label"
              >
                <InputLabel id="due-type-label">{t('exportFlowReservation.dueTipePlaceHolder')}</InputLabel>
                <Select
                  fullWidth
                  labelId="due-type-label"
                  value={selectedValueDueTipe}
                  onChange={(event) => setSelectedValueDueTipe(event.target.value)}
                  label={t('exportFlowReservation.fileVersion')}
                >
                  {selectOptionsDueTipe.map((option, index) => (
                    <MenuItem key={index} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <Grid container direction={'row'} justifyContent={'space-between'}>
        <Grid item>
          <Button
            size="large"
            variant="outlined"
            fullWidth
            startIcon={<ArrowBack />} >
            {t('exportFlowReservation.buttonGoBack')}
          </Button>
        </Grid>
        <Grid item>
          <Button
            size="large"
            variant="contained"
            fullWidth >
            {t('exportFlowReservation.buttonConfirmReservation')}
          </Button>
        </Grid>
      </Grid>

    </>
  );
};

export default ExportFlowReservation;