import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import DetailContainer, { DetailData } from '../DetailContainer/DetailContainer';


export const ReportingPaymentDetail = () => {

  const { t } = useTranslation();

  const summaryData: DetailData[] = [
    { label: 'IUV', value: '0300330000000001', variant: 'monospaced' },
    { label: 'Importo', value: '50,00 €' },
    { label: 'Causale', value: 'TARI 2024' },
    { label: 'Tipo dovuto', value: 'TARI' }
  ];

  const paymentData: DetailData[] = [
    { label: 'Data esito', value: '01/09/2024' },
    { label: 'Pagatore', value: 'Maria Bianchi [CF/PIVA: BNCMRA82B42C933X (Persona fisica)]' },
    { label: 'Anagrafica Pagatore', value: 'Maria Bianchi' },
    { label: 'CF / Partita IVA Pagatore', value: 'BNCMRA82B42C933X (Persona fisica)' },
    { label: 'Attestante', value: 'POSTMAN_TEST' },
    { label: 'IUD', value: '000a99aa114e6b142268f27abb8b347c37d' },
    { label: 'IUR', value: 'hR3sT2uG888KkKK' },
    { label: 'Stato', value: 'Pagato' },
  ];


  return (
    <>
      <TitleComponent 
        title={t('commons.routes.REPORTING_PAYMENT_DETAIL')}
      />
      <Grid container spacing={3}>
        <Grid item lg={6} md={6}>
          <DetailContainer 
            sections={[{title: t('commons.summary'), data: [...summaryData]}]} 
          />
        </Grid>
        <Grid item lg={6} md={6}>
          <DetailContainer 
            sections={[{title: t('commons.payment'), data: [...paymentData]}]}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ReportingPaymentDetail;
