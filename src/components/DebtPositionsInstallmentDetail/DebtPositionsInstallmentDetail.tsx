import { Download, History, ReadMore, Visibility } from '@mui/icons-material';
import { Button, Divider, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import DetailContainer, { DetailData } from '../DetailContainer/DetailContainer';
import EmptyDetailContainer from './EmptyDetailContainer';
import { InstallmentDTO } from '../../../generated/apiClient';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import { getInstallmentDetail } from '../../api/debtPositions';
import { moneyFormat } from '../../utils/formatters';
import { useParams } from 'react-router-dom';


export const DebtPositionsInstallmentDetail = () => {

  const { t } = useTranslation();
  const { state } = useStore();
  const { id } = useParams<{ id: string }>();
  
  type DebtStatus = Pick<InstallmentDTO, 'status'>['status'];
  
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);
  const installmentId = Number(id);

  const { data: installment } = getInstallmentDetail(
    organizationId, 
    installmentId
  );
  
  const DEBT_RESOLVED_STATES: DebtStatus[] = ['PAID', 'REPORTED'];
  const isResolved = installment?.status && DEBT_RESOLVED_STATES.includes(installment.status);

  type DetailDataValue = Record<string, DetailData[]> | DetailData[];

  const summaryTitle: string = installment?.debtPositionDescription || '';
  
  const installmentDetailData: DetailDataValue = {
    summaryData: [
      { label: t('commons.state'), value: installment?.status || '', chipConfig: {color: 'default', variant: 'outlined'} },
      { label: t('debtPositionSearchResults.iuv'), value: installment?.iuv || '', variant: 'monospaced' },
      { label: t('debtPositionSearchResults.amount'), value: moneyFormat(installment?.amountCents as number) },
      { label: t('debtPositionSearchResults.expirationDate'), value: installment?.dueDate ? new Date(installment?.dueDate).toLocaleDateString('it-IT') : '' },
      { label:  t('commons.debtor'), value: installment?.debtor?.fullName || '' },
      { label: t('commons.fiscalCodeorVatExecutor'), value: `${installment?.debtor?.fiscalCode} ${installment?.debtor?.entityType === 'F' ? `(${t('commons.individual')})` : ''}`},
      { label: t('commons.duetype'), value: installment?.debtPositionTypeOrgDescription || '' },
    ],
    paymentData: [
      { label: t('commons.paymentdate'), value: installment?.paymentDateTime ? new Date(installment?.paymentDateTime).toLocaleDateString('it-IT') : '' },
      { label: t('commons.executedBy'), value: installment?.payer?.fullName || '' },
      { label: t('commons.fiscalCodeorVatExecutor'), value: `${installment?.payer?.fiscalCode} ${installment?.payer?.entityType === 'F' ? `(${t('commons.individual')})` : ''}`},
      { label: t('commons.transactionManager'), value: installment?.pspCompanyName || '' },
      { label: t('commons.iud'), value: installment?.iud || '' },
      { label: t('commons.iur'), value: installment?.iur || '' },
    ]
  };

  return (
    <>
      <TitleComponent 
        title={t('commons.routes.DEBT_POSITION_INSTALLMENT_DETAIL')}
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
              buttonText: t('commons.downloadInstallment'), 
              onActionClick: () => console.log('download')
            }
          ]
        } 
      />
      <Grid container spacing={3}>
        <Grid item md={6}>
          <DetailContainer 
            sections={[{
              title: {label: t(summaryTitle), variant: 'h6'}, 
              data: installmentDetailData.summaryData, 
              inline: true, 
              footerLink: { 
                label: t('commons.showDebtPositions'), 
                icon: <Visibility />, 
                onLinkClick: () => console.log('debtPositionId', installment?.debtPositionId)
              }
            }]}
          />
        </Grid>
        <Grid item md={6}>
          {isResolved ? (
            <DetailContainer 
              sections={[{
                title: {label: t('commons.paymentInformation'), variant: 'overline'},
                data: installmentDetailData.paymentData,
                divider: true
              }]}
            />
          ) : (<EmptyDetailContainer />)}
        </Grid>
      </Grid>
      <Divider orientation="horizontal" flexItem sx={{ display: 'block', mt: 3}}/>
      <Grid container mt={1}>
        <Button
          size="large"
          endIcon={<ReadMore />}
          variant="text"
          fullWidth={false}
          onClick={() => console.log('installmentId: ', installmentId)} 
        >
          {t('commons.showOtherBeneficiaries')}
        </Button>
      </Grid>
    </>
  );
};

export default DebtPositionsInstallmentDetail;
