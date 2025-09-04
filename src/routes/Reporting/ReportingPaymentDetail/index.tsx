import { useEffect } from 'react';
import { Grid } from '@mui/material';
import { generatePath } from 'react-router';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import DetailContainer, {
  DetailData
} from '../../../components/DetailContainer/DetailContainer';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import { useStore } from '../../../store/GlobalStore';
import { getPaymentsReportingDetail } from '../../../api/getPaymentsReportingDetail';
import { setAppState } from '../../../store/AppStateStore';
import { formatDate } from '../../../utils/formatters';
import { BredcrumbItem } from '../../../components/Breadcrumbs/Breadcrumbs';
import { PageRoutes } from '../../../routes';

function ReportingPaymentDetail() {
  const { iuf, id } = useParams();
  const { t } = useTranslation();
  const {
    state: { organizationId }
  } = useStore();
  const navigate = useNavigate();

  if (!iuf || !id) {
    navigate(PageRoutes.RESPONSES_ERROR);
    return null;
  }

  const { data, isLoading, isError, error } = getPaymentsReportingDetail(
    organizationId,
    iuf,
    id
  );

  useEffect(() => {
    if (isError && error) {
      console.error('Error loading payment reporting detail:', error);
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  }, [isError, error, navigate]);

  useEffect(() => {
    if (data && iuf) {
      const customBreadcrumbsItems: Array<BredcrumbItem> = [
        {
          pathname: PageRoutes.REPORTING_INDEX,
          id: 'REPORTING_INDEX',
          label: t('commons.routes.REPORTING')
        },
        {
          pathname: generatePath(PageRoutes.REPORTING_DETAIL, {
            id: iuf
          }),
          id: 'REPORTING_DETAIL',
          label: iuf
        },
        {
          pathname: generatePath(PageRoutes.REPORTING_PAYMENT_DETAIL, {
            iuf: iuf,
            id: data.paymentsReportingId
          }),
          id: 'REPORTING_PAYMENT_DETAIL'
        }
      ];
      setAppState({
        loading: false,
        customBreadcrumbsItems: customBreadcrumbsItems
      });
    }
  }, [data, iuf]);

  const debtorType: string =
    data?.debtor?.entityType == 'F' ? `(${t('commons.person')})` : '';

  const getPayerValue = (
    debtor: { fullName?: string; fiscalCode?: string } | undefined
  ) => {
    if (!debtor?.fullName) {
      return '';
    }
    const fiscalCodeInfo = debtor.fiscalCode
      ? ` [${t('commons.fiscalCodeorVat')}: ${debtor.fiscalCode} ${debtorType}]`
      : '';
    return `${debtor.fullName}${fiscalCodeInfo}`;
  };

  const summaryData: Array<DetailData> = [
    {
      label: t('commons.iuv'),
      value: data?.iuv || '',
      variant: 'monospaced'
    },
    {
      label: t('commons.amount'),
      value: data?.amountPaidCents,
      valueType: 'amount'
    },
    {
      label: t('commons.reason'),
      value: data?.remittanceInformation || ''
    },
    {
      label: t('commons.duetype'),
      value: data?.debtPositionTypeOrgDescription || ''
    }
  ];

  const paymentData: Array<DetailData> = [
    {
      label: t('commons.paymentdate'),
      value: data?.paymentDateTime ? formatDate(data.paymentDateTime) : ''
    },
    {
      label: t('commons.payer'),
      value: getPayerValue(data?.debtor)
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
    }
  ];

  return !isLoading ? (
    <>
      <TitleComponent
        title={t('reportingPaymentDetail.title')}
        accessibleTitle={t('reportingPaymentDetail.accessibleTitle')}
      />
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
  ) : null;
}

export default ReportingPaymentDetail;
