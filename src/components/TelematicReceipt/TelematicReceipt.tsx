import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import SearchCard from '../SearchCard/SearchCard';
import ActionCard from '../ActionCard/ActionCard';
import { ArrowForwardIos, DateRange, Download, Search, Upload } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';

export const TelematicReceipt = () => {

  const theme = useTheme();

  const breadcrumbs = {
    elements: [
      { name: 'flows', fontWeight:600, color: theme.palette.text.primary },
      { name: 'telematicreceipt', color: theme.palette.text.disabled }
    ]
  };

  return (
    <>

      <Breadcrumbs separator={<ArrowForwardIos sx={{ fontSize: '0.75rem' }} />} crumbs={breadcrumbs} />
      <Grid container direction="row">
        <Grid container direction="column">
          <Grid item mb={2}>
            <Typography variant="h3" >
            Ricevute Telematiche
            </Typography>
          </Grid>
          <Grid item mb={3}>
            <Typography variant="body1">
            Ricerca, visualizza o integra delle Ricevute Telematiche nei tipi dovuti in cui sei abilitato. 
            </Typography>
          </Grid>
        </Grid>

        <Grid container spacing={2} 
          // width={900}
        >
          <Grid item xs={12} md={6}>
            <SearchCard
              title="Cerca Ricevuta Telematica"
              description="Inserisci al meno uno dei campi per cominciare la ricerca."
              searchFields={[
                { label: 'Cerca IUV', icon: <Search /> },
                { label: 'Dal', icon: <DateRange />, gridWidth: 6},
                { label: 'Al', icon: <DateRange />, gridWidth: 6 },
              ]}
              selectOptions={[
                { label: 'TARI', value: 'tari' },
                { label: 'Violazione al codice della strada', value: 'violation' },
                { label: 'Reset', value: ''}
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <ActionCard
              title="Scarica Flussi di Ricevute Telematiche"
              description="Richiede l’esportazione di Ricevute Telematiche in un certo intervallo di tempo."
              actionLabel="Prenota export"
              actionIcon={<Download/>}
              linkLabel="Vedi flussi esportati"
              onActionClick={() => console.log('Export triggered')}
              onLinkClick={() => console.log('View exports')}
            />

            <ActionCard
              title="Importa Flussi di Ricevute Telematiche"
              description="Carica un file .zip con l’informazione necessaria di Ricevute Telematiche mancanti."
              actionLabel="Importa flusso"
              actionIcon={<Upload/>}
              linkLabel="Vedi flussi importati"
              onActionClick={() => console.log('Import triggered')}
              onLinkClick={() => console.log('View imports')}
            />
          </Grid>
        </Grid>

      </Grid>
    </>
  );
};

export default TelematicReceipt;
