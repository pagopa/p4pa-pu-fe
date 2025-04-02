import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DetailContainer, {
  DetailData
} from '../../components/DetailContainer/DetailContainer';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { Grid, ChipProps } from '@mui/material';
import { useStore } from '../../store/GlobalStore';
import { getPaymentsReportingDetail } from '../../api/getPaymentsReportingDetail';
import { STATE } from '../../store/types';
import { setLoading } from '../../store/AppStateStore';
import { formatDate } from '../../utils/formatters';

function ReportingPaymentDetail() {
  const { iuf, id } = useParams();
  const { t } = useTranslation();
  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  // Definizione dei colori per gli stati
  const stateColors: Record<string, ChipProps['color']> = {
    CANCELLED: 'error',
    DRAFT: 'default',
    EXPIRED: 'error',
    PAID: 'success',
    PARTIALLY_PAID: 'info',
    REPORTED: 'success',
    TO_SYNC: 'default',
    UNPAID: 'info',
    INVALID: 'error'
  };

  const { data, isLoading } = getPaymentsReportingDetail(
    organizationId,
    iuf ?? '',
    id ?? ''
  );

  setLoading(isLoading);

  const debtorType: string =
    data?.debtor?.entityType == 'F' ? `(${t('commons.person')})` : '';

  const summaryData: Array<DetailData> = [
    {
      label: t('commons.iuv'),
      value: data?.iuv || '',
      variant: 'monospaced'
    },
    {
      label: t('commons.amount'),
      value: data?.amountPaidCents ? data?.amountPaidCents : ''
    },
    {
      label: t('commons.reason'),
      value: data?.debtPositionTypeOrgDescription || ''
    },
    {
      label: t('commons.duetype'),
      value: data?.remittanceInformation || ''
    }
  ];

  const paymentData: Array<DetailData> = [
    {
      label: t('commons.paymentdate'),
      value: data?.paymentDateTime ? formatDate(data.paymentDateTime) : ''
    },
    {
      label: t('commons.payer'),
      value: data?.debtor?.fullName
        ? `${data.debtor.fullName}${data?.debtor?.fiscalCode ? ` [${t('commons.fiscalCodeorVat')}${':'} ${data.debtor.fiscalCode} ${debtorType}]` : ''}`
        : ''
    },
    {
      label: t('commons.payerDetails'),
      value: data?.debtor?.fullName || ''
    },
    {
      label: t('commons.fiscalCodeorVat') + ' ' + t('commons.payer'),
      value: data?.debtor?.fiscalCode
        ? `${data.debtor.fiscalCode} ${debtorType}`
        : ''
    },
    {
      label: t('commons.auditor'),
      value: data?.pspCompanyName || ''
    },
    {
      label: t('commons.iud'),
      value: data?.iud || ''
    },
    {
      label: t('commons.iur'),
      value: data?.iur || ''
    },
    {
      label: t('commons.state'),
      value: data?.status || '',
      chipConfig: {
        color: stateColors[data?.status || ''],
        variant: 'filled'
      }
    }
  ];

  return (
    <>
      {!isLoading && (
        <>
          <TitleComponent title={t('reportingPaymentDetail.title')} />
          <Grid container spacing={3}>
            <Grid item md={6}>
              <DetailContainer
                sections={[
                  {
                    title: { label: t('commons.summary'), variant: 'overline' },
                    data: summaryData
                  }
                ]}
              />
            </Grid>
            <Grid item md={6}>
              <DetailContainer
                sections={[
                  {
                    title: { label: t('commons.payment'), variant: 'overline' },
                    data: paymentData
                  }
                ]}
              />
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
}

export default ReportingPaymentDetail;
