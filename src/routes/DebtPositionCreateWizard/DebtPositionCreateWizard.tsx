import { Box, Grid, Step, StepLabel, Stepper, Typography } from '@mui/material';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { useTranslation } from 'react-i18next';
import { theme } from '@pagopa/mui-italia';

const DebtPositionCreateWizard = () => {
  const { t } = useTranslation();

  const steps = [
    'Configurazione Generale',
    'Aggiungi Debitore',
    'Configurazione Avviso'
  ];

  return (
    <>
      <Grid container direction="column" alignItems="center" marginTop={2}>
        <Grid
          container
          direction="column"
          alignItems="left"
          marginTop={2}
          ml={1}
          mb={4}
        >
          <TitleComponent
            title={'Crea una nuova Posizione Debitoria'}
            description={'Compila i campi e crea una Posizione Debitoria'}
          />
          <Grid item lg={12} mb={6} mt={2}>
            <Stepper activeStep={0} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Grid>
          <Box
            bgcolor={theme.palette.common.white}
            borderRadius={0.5}
            p={3}
            gap={3}
          >
            <Grid item lg={12} mb={2}>
              <Grid item lg={12} mb={2}>
                <Typography variant="h4" gutterBottom>
                  {'Configurazione Generale'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {
                    'Scegli tipo di dovuto su cui creare il nuovo dovuto e assegnarle un nome per il successivo tracciamento.'
                  }
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default DebtPositionCreateWizard;
