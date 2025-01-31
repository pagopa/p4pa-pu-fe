import { Download } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import DetailContainer, { DetailData } from '../DetailContainer/DetailContainer';


export const TelematicReceiptDetail = () => {

  const { t } = useTranslation();

  const summaryData: DetailData[] = [
    { label: 'IUV', value: '0300330000000001', variant: 'monospaced' },
    { label: 'Importo', value: '50,00 €' },
    { label: 'Causale', value: 'TARI 2024' },
    { label: 'Tipo dovuto', value: 'TARI' },
    { label: 'Pagatore', value: 'Maria Bianchi' },
    { label: 'CF / Partita IVA', value: 'BNCMRA82B42C933X (Persona fisica)' },
  ];

  const paymentData: DetailData[] = [
    { label: 'Data esito', value: '01/09/2024' },
    { label: 'Versante', value: 'Paolo Rossi' },
    { label: 'CF / Partita IVA', value: 'PLRSRA82B42C933X (Persona fisica)' },
    { label: 'Attestante', value: 'POSTMAN_TEST' },
    { label: 'IUD', value: '000a99aa114e6b142268f27abb8b347c37d' },
    { label: 'IUR', value: 'hR3sT2uG888KkKK' },
  ];


  return (
    <>
      <TitleComponent 
        title={t('telematicReceiptDetail.title')}
        callToAction={
          [
            {
              icon: <Download />, 
              variant: 'contained', 
              buttonText: t('commons.files.download'), 
              onActionClick: () => console.log('download')
            },
          ]
        } 
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

export default TelematicReceiptDetail;
