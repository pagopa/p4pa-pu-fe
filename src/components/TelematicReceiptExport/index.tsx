import { ArrowForward, ArrowForwardIos, DateRange, Download, Search, Upload } from '@mui/icons-material';
import { Box, Button, Divider, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography, useTheme } from '@mui/material';
import { SearchButton } from '../../components/SearchButton';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { useState } from 'react';

export const TelematicReceiptExport = () => {
  const theme = useTheme();

  const [value, setValue] = useState('');

  const breadcrumbs = {
    elements: [
      { name: 'flows', fontWeight:600, color: theme.palette.text.primary },
      { name: 'telematicreceipt', color: theme.palette.text.disabled }
    ]
  };

  return (
    <>
      <Breadcrumbs separator={<ArrowForwardIos sx={{ fontSize: '0.75rem' }} />} crumbs={breadcrumbs} />

      <Grid container direction="column">
        <Grid item mb={2}>
          <Typography variant="h3" >
            Ricevute Telematiche
          </Typography>
        </Grid>
        <Grid item mb={2}>
          <Typography variant="body1">
            Ricerca, visualizza o integra delle Ricevute Telematiche nei tipi dovuti in cui sei abilitato. 
          </Typography>
        </Grid>
      </Grid>
      <Grid container direction="row" spacing={3}>
        <Grid item>
          <Box mt={2} display={'flex'} flexDirection={'column'} width={'530px'} borderRadius={'4px'} padding={'24px'} sx={{backgroundColor: theme.palette.background.paper}}>
            <Grid container>
              <Grid md={12} mb={1}>
                <Typography variant="h4" >
                  Cerca Ricevuta Telematica
                </Typography>
              </Grid>
              <Grid md={12} mb={1}>
                <Typography variant="body2" color={theme.palette.text.secondary}>
                  Inserisci al meno uno dei campi per cominciare la ricerca.
                </Typography>
              </Grid>
              <Grid md={12} my={1}>
                <TextField
                  InputProps={{
                    endAdornment: <InputAdornment position="end"><Search/></InputAdornment>
                  }}
                  label="Cerca IUV"
                  placeholder=""
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid container md={12} direction="row"
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }} my={1}>
                <Grid item lg={6}>
                  <TextField
                    InputProps={{
                      endAdornment: <InputAdornment position="end"><DateRange/></InputAdornment>
                    }}
                    label="Dal"
                    placeholder=""
                    size="small"
                  />
                </Grid>
                <Grid item lg={6}>
                  <TextField
                    InputProps={{
                      endAdornment: <InputAdornment position="end"><DateRange/></InputAdornment>
                    }}
                    label="Al"
                    placeholder=""
                    size="small"
                  />
                </Grid>
              </Grid>
              <Grid container md={12} my={1}>
                <FormControl
                  fullWidth
                  size="small"
                >
                  <InputLabel id="search-by-label">
                    Tipo dovuto
                  </InputLabel>
                  <Select
                    id="search-by"
                    label="Tipo dovuto"
                    labelId="search-by-label"
                    onChange={(event) => setValue(event.target.value)}
                    value={value}
                  >
                    <MenuItem
                      selected
                      value="tari"
                    >
                      TARI
                    </MenuItem>
                    <MenuItem
                      selected
                      value="violation"
                    >
                      Violazione al codice della stada
                    </MenuItem>
                    <MenuItem 
                      selected
                      value="">
                      Empty
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid container md={12} direction="row-reverse" my={2}>
                <SearchButton/>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        <Grid item>
          <Box mt={2} display={'flex'} flexDirection={'column'} width={'487px'} borderRadius={'4px'} padding={'24px'} sx={{backgroundColor: theme.palette.background.paper}}>
            <Grid container>
              <Grid md={12} mb={1}>
                <Typography variant="h4" >
                  Scarica Flussi di Ricevute Telematiche
                </Typography>
              </Grid>
              <Grid md={12} mb={3}>
                <Typography variant="body2" color={theme.palette.text.secondary}>
                  Richiede l’esportazione di Ricevute Telematiche in un certo intervallo di tempo.
                </Typography>
              </Grid>
              <Grid md={12} mb={3}>
                <Button
                  size="large"
                  startIcon={<Download/>}
                  variant="outlined"
                >
                  Prenota export
                </Button>
              </Grid>
              <Grid md={12}>
                <Divider orientation="horizontal" flexItem sx={{ display : 'block'}}/>
              </Grid>
              <Grid md={12} ml={-1} mt={2}>
                <Button
                  size="large"
                  endIcon={<ArrowForward/>}
                  variant="text"
                >
                  Vedi flussi esportati
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Box mt={3} display={'flex'} flexDirection={'column'} width={'487px'} borderRadius={'4px'} padding={'24px'} sx={{backgroundColor: theme.palette.background.paper}}>
            <Grid container>
              <Grid md={12} mb={1}>
                <Typography variant="h4" >
                  Importa Flussi di Ricevute Telematiche
                </Typography>
              </Grid>
              <Grid md={12} mb={3}>
                <Typography variant="body2" color={theme.palette.text.secondary}>
                  Carica un file .zip con l’informazione necessaria di Ricevute Telematiche mancanti.
                </Typography>
              </Grid>
              <Grid md={12} mb={3}>
                <Button
                  size="large"
                  startIcon={<Upload/>}
                  variant="outlined"
                >
                  Importa flusso
                </Button>
              </Grid>
              <Grid md={12}>
                <Divider orientation="horizontal" flexItem sx={{ display : 'block'}}/>
              </Grid>
              <Grid md={12} ml={-1} mt={2}>
                <Button
                  size="large"
                  endIcon={<ArrowForward/>}
                  variant="text"
                >
                  Vedi flussi importati
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default TelematicReceiptExport;
