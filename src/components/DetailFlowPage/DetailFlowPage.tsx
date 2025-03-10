import { Download } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import DetailContainer, { DetailData } from '../DetailContainer/DetailContainer';
import { detailConfig } from '../../models/DetailFlowConfig';
import { useParams } from 'react-router-dom';


export const DetailFlowPage = () => {

  const { t } = useTranslation();
  
  const { category } = useParams<{category: string}>();
  
  const config = detailConfig[category as keyof typeof detailConfig];
  
  /*START - TMP MOCK DATA*/
  type DetailDataValue = Record<string, DetailData[]> | DetailData[];
  const tmpMockData: Record<string, DetailDataValue> = {
    reporting: {
      summaryData: [
        { label: 'IUV', value: '03234234234324', variant: 'monospaced' },
        { label: 'Importo', value: '80,00 €' },
        { label: 'Causale', value: 'TARI 2024' },
        { label: 'Tipo dovuto', value: 'TARI' }
      ],
      paymentData: [
        { label: 'Data esito', value: '11/09/2024' },
        { label: 'Pagatore', value: 'Maria Bianchi [CF/PIVA: BNCMRA82B42C933X (Persona fisica)]' },
        { label: 'Anagrafica Pagatore', value: 'Maria Bianchi' },
        { label: 'CF / Partita IVA Pagatore', value: 'BNCMRA82B42C933X (Persona fisica)' },
        { label: 'Attestante', value: 'POSTMAN_TEST' },
        { label: 'IUD', value: '000a99aa114e6b142268f27abb8b347c37d' },
        { label: 'IUR', value: 'hR3sT2uG888KkKK' },
        { label: 'Stato', value: 'Pagato' },
      ]
    },
    receipt: {
      summaryData: [
        { label: 'IUV', value: '0300330000000001', variant: 'monospaced' },
        { label: 'Importo', value: '50,00 €' },
        { label: 'Causale', value: 'TARI 2024' },
        { label: 'Tipo dovuto', value: 'TARI' },
        { label: 'Pagatore', value: 'Maria Bianchi' },
        { label: 'CF / Partita IVA', value: 'BNCMRA82B42C933X (Persona fisica)' },
      ],
      paymentData: [
        { label: 'Data esito', value: '01/09/2024' },
        { label: 'Versante', value: 'Paolo Rossi' },
        { label: 'CF / Partita IVA', value: 'PLRSRA82B42C933X (Persona fisica)' },
        { label: 'Attestante', value: 'POSTMAN_TEST' },
        { label: 'IUD', value: '000a99aa114e6b142268f27abb8b347c37d' },
        { label: 'IUR', value: 'hR3sT2uG888KkKK' },
      ]
    },
    treasury: [
      { label: 'Codice Boletta', value: '2000777' },
      { label: 'Anno Boletta', value: '2024' },
      { label: 'ID Rendicontazione', value: '2024-09-03PPAYITR1XXX-S500333000012024' },
      { label: 'Ordinante', value: '' },
      { label: 'Data Valuta', value: '02/09/2024' },
      { label: 'Data Contabile', value: '02/09/2024' },
      { label: 'Conto', value: '' },
      { label: 'Anno Codice Documento', value: '' },
      { label: 'Codice documento', value: '3000777' },
      { label: 'Anno Codice Provvisorio', value: '' },
      { label: 'Codice Provvisorio', value: '' },
      { label: 'Causale', value: 'ACCREDITO INCASSI DEBITORE 321/PUR/LGPE-RIVERSAMENTO/URI/2024-09-03PPAYITR1XXX-S50033300001' },
    ]
  };

  const data = tmpMockData[category ?? ''] as Record<string, DetailData[]> | DetailData[];
  const summaryData = Array.isArray(data) ? data : data?.summaryData || [];
  const paymentData = Array.isArray(data) ? [] : data?.paymentData || [];
  /*END - TMP MOCK DATA*/

  return (
    <>
      <TitleComponent 
        title={t(config.title)}
        callToAction= {
          config.downloadButton ? [
            {
              icon: <Download />, 
              variant: 'contained', 
              buttonText: t('commons.files.download'), 
              onActionClick: () => console.log('download')
            }
          ] : undefined
        } 
      />
      {config.splitCard ? 
        <Grid container spacing={3}>
          <Grid item md={6}>
            <DetailContainer 
              sections={[{title: {label: t('commons.summary'), variant: 'overline'}, data: summaryData}]} 
            />
          </Grid>
          <Grid item md={6}>
            <DetailContainer 
              sections={[{title: {label: t('commons.payment'), variant: 'overline'}, data: paymentData}]}
            />
          </Grid>
        </Grid> :
        <Grid container spacing={2}>
          <Grid item md={12}>
            <DetailContainer 
              sections={[
                {
                  data: summaryData
                }
              ]}
            />
          </Grid>
        </Grid>
      }
    </>
  );
};

export default DetailFlowPage;
