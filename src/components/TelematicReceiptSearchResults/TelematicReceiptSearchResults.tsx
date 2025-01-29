import { Box, Button, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, TextField, useTheme } from '@mui/material';
import { CalendarToday, Search } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import SearchResultsDataGrid from './SearchResultsDataGrid';
import React from 'react';
import TitleComponent from '../TitleComponent/TitleComponent';

const TelematicReceiptSearchResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [selectedValue, setSelectedValue] = React.useState('');

  return (
    <>
      <Box sx={{ flex: 1, position: 'relative' }}>
        <Box sx={{ position: 'absolute', inset: 0 }}>
          <TitleComponent 
            title={t('commons.routes.TELEMATIC_RECEIPT_SEARCH_RESULTS')}
            description={t('telematicreceiptSearchResults.description')} 
          />
          <Grid container direction="row">
            <Grid container 
              direction="row" 
              spacing={2} 
              alignItems={'center'} 
              justifyContent={'space-between'} 
              mb={2}
              component='div'
              aria-label={t('commons.filters.filtersField')}
            >
              <Grid item lg={3}>
                <TextField
                  sx={{ bgcolor: theme.palette.common.white }}
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
                  }}
                  label={t('telematicreceiptSearchResults.searchIUV')}
                />
              </Grid>
              <Grid item lg={3}>
                <FormControl
                  fullWidth
                  size="small"
                  sx={{ my: 2, bgcolor: theme.palette.common.white }}
                  role="combobox"
                  aria-labelledby="due-type-label"
                >
                  <InputLabel id="due-type-label">{t('commons.duetype')}</InputLabel>
                  <Select
                    labelId="due-type-label"
                    value={selectedValue}
                    onChange={(event) => setSelectedValue(event.target.value)}
                    label={t('commons.duetype')}
                  >
                    <MenuItem >
                  Placeholder
                    </MenuItem>
                  </Select>
                </FormControl>
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
            </Grid>
            <Grid 
              container
              p={2}
              height="100%"
              sx={{
                bgcolor: theme.palette.grey[200],
                overflow: 'auto'
              }}
              aria-label='results-table'
            >
              <SearchResultsDataGrid />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default TelematicReceiptSearchResults;
