import { Download, History, ReadMore, Visibility } from '@mui/icons-material';
import { Button, Divider, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import DetailContainer, { DetailData } from '../DetailContainer/DetailContainer';
import EmptyDetailContainer from './EmptyDetailContainer';


export const DebtPositionsInstallmentDetail = () => {

  const DEBT_RESOLVED_STATES = ['PAID', 'REPORTED'];
  const DEBT_PENDING_STATES = ['UNPAID', 'EXPIRED', 'INVALID', 'CANCELLED'];
  
  /*START - TMP MOCK DATA*/
  type DetailDataValue = Record<string, DetailData[]> | DetailData[];
  const summaryTitleMock: string = 'Saldo Tari 2025';
  const tmpMockData: DetailDataValue = {
    summaryData: [
      { label: 'Stato', value: 'PAID', chipConfig: {color: 'default', variant: 'outlined'} },
      { label: 'Codice Avviso (IUV)', value: '0300330000000001', variant: 'monospaced' },
      { label: 'Importo', value: '50,00 €' },
      { label: 'Data scadenza', value: '24/03/2025' },
      { label: 'Debitore', value: 'Maria Bianchi' },
      { label: 'CF / Partita IVA', value: 'BNCMRA82B42C933X (Persona fisica)' },
      { label: 'Tipo dovuto', value: 'TARI' },
    ],
    paymentData: [
      { label: 'Data esito', value: '01/09/2024' },
      { label: 'Eseguito da', value: 'Paolo Rossi' },
      { label: 'CF / Partita IVA', value: 'PLRSRA82B42C933X (Persona fisica)' },
      { label: 'Gestore della transazione (PSP)', value: 'POSTMAN_TEST' },
      { label: 'IUD', value: '000a99aa114e6b142268f27abb8b347c37d' },
      { label: 'IUR', value: 'hR3sT2uG888KkKK' },
    ]
  };

  const { t } = useTranslation();

  const currentState = tmpMockData.summaryData.find(item => item.label === 'Stato')?.value;

  const isResolved = currentState && DEBT_RESOLVED_STATES.includes(currentState);
  const isPending = currentState && DEBT_PENDING_STATES.includes(currentState);

  return (
    <>
      <TitleComponent 
        title={t('installmentDetailPage.title')}
        callToAction= {
          [
            {
              icon: <History />, 
              variant: 'text',
              onActionClick: () => console.log('history')
            },
            {
              icon: <Download />, 
              variant: 'contained', 
              buttonText: t('installmentDetailPage.downloadInstallment'), 
              onActionClick: () => console.log('download')
            }
          ]
        } 
      />
      <Grid container spacing={3}>
        <Grid item md={6}>
          <DetailContainer 
            sections={[{
              title: {label: t(summaryTitleMock), variant: 'h6'}, 
              data: tmpMockData.summaryData, 
              inline: true, 
              footerLink: { label: t('installmentDetailPage.showDebtPositions'), icon: <Visibility /> }
            }]}
          />
        </Grid>
        <Grid item md={6}>
          {isResolved && (
            <DetailContainer 
              sections={[{
                title: {label: t('installmentDetailPage.paymentInformation'), variant: 'overline'},
                data: tmpMockData.paymentData,
                divider: true
              }]}
            />
          )}
          
          {isPending && (
            <EmptyDetailContainer />
          )}
        </Grid>
      </Grid>
      <Divider orientation="horizontal" flexItem sx={{ display: 'block', mt: 3}}/>
      <Grid container mt={1}>
        <Button
          size="large"
          endIcon={<ReadMore />}
          variant="text"
          fullWidth={false}
          onClick={() => console.log('')} 
        >
          {t('installmentDetailPage.showOtherBeneficiaries')}
        </Button>
      </Grid>
    </>
  );
};

export default DebtPositionsInstallmentDetail;
