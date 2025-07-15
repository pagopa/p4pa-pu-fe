import { Download } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  useLoaderData,
  useNavigate,
  useParams,
  generatePath
} from 'react-router';
import { getReceiptDetail } from '../../api/receiptDetail';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import DetailContainer, {
  DetailData
} from '../../components/DetailContainer/DetailContainer';
import { getReceiptPdf } from '../../api/receiptPdf';
import utils from '../../utils';
import { downloadBlob } from '../../utils/download';
import { useEffect } from 'react';
import { PageRoutes } from '../../routes';

import { setAppState } from '../../store/AppStateStore';
import { BredcrumbItem } from '../../components/Breadcrumbs/Breadcrumbs';
import { moneyFormat } from '../../utils/formatters';

export const TelematicReceiptDetail = () => {
  const { t } = useTranslation();
  const { state } = useStore();
  const navigate = useNavigate();
  const params = useParams();

  // If we are on the assessment route, use assessmentDetailId, otherwise useLoaderData
  const loaderData = useLoaderData();
  const id = params.assessmentDetailId || loaderData;

  // Get organizationId from the store
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const getContextualTranslation = (
    assessmentKey: string,
    defaultKey: string
  ) => {
    if (params.assessmentDetailId) {
      return t(assessmentKey);
    }
    return t(defaultKey);
  };

  const { data, isError, error } = getReceiptDetail(organizationId, Number(id));

  // Setup custom breadcrumb for assessment context
  useEffect(() => {
    if (params.assessmentDetailId && params.id && data) {
      const customBreadcrumbsItems: Array<BredcrumbItem> = [
        {
          pathname: PageRoutes.ASSESSMENT_INDEX,
          id: 'ASSESSMENT'
        },
        {
          pathname: PageRoutes.ASSESSMENT_SEARCH_RESULTS,
          id: 'ASSESSMENT_SEARCH_RESULTS'
        },
        {
          pathname: generatePath(PageRoutes.ASSESSMENT_DETAIL, {
            id: params.id
          }),
          label: `Accertamento ${params.id}`,
          id: 'ASSESSMENT_DETAIL'
        },
        {
          pathname: generatePath(PageRoutes.ASSESSMENT_DETAIL_DETAIL, {
            id: params.id,
            assessmentDetailId: params.assessmentDetailId
          }),
          label: t('assessmentDetail.paymentDetail.title'),
          id: 'ASSESSMENT_DETAIL_DETAIL'
        }
      ];
      setAppState({
        loading: false,
        customBreadcrumbsItems: customBreadcrumbsItems
      });
    }
  }, [params.assessmentDetailId, params.id, data, t]);

  useEffect(() => {
    if (isNaN(Number(id)) || isNaN(organizationId) || organizationId <= 0) {
      navigate(PageRoutes.RESPONSES_ERROR);
      return;
    }
    if (isError && error) {
      console.error('Error loading receipt detail:', error);
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  }, [id, organizationId, isError, error, navigate]);

  if (isNaN(Number(id)) || isNaN(organizationId) || organizationId <= 0) {
    return null;
  }

  const debtorType: string =
    data?.debtor.entityType == 'F' ? `(${t('commons.person')})` : '';

  const summaryData: Array<DetailData> = [
    {
      label: getContextualTranslation(
        'assessmentDetail.paymentDetail.iuv',
        'commons.iuv'
      ),
      value: data?.iuv || '-'
    },
    {
      label: getContextualTranslation(
        'assessmentDetail.paymentDetail.amount',
        'commons.amount'
      ),
      value: moneyFormat(data?.paymentAmountCents as number) || '-'
    },
    {
      label: getContextualTranslation(
        'assessmentDetail.paymentDetail.paymentObject',
        'commons.reason'
      ),
      value: data?.debtPositionTypeOrgDescription || '-'
    },
    {
      label: getContextualTranslation(
        'assessmentDetail.paymentDetail.duetype',
        'commons.duetype'
      ),
      value: data?.remittanceInformation || '-'
    },
    {
      label: getContextualTranslation(
        'assessmentDetail.paymentDetail.debtor',
        'commons.debtor'
      ),
      value: data?.debtor.fullName || '-'
    },
    {
      label: getContextualTranslation(
        'assessmentDetail.paymentDetail.fiscalCode',
        'commons.fiscalCodeorVat'
      ),
      value: `${data?.debtor.fiscalCode || '-'} ${debtorType}`
    }
  ];

  const paymentData: Array<DetailData> = [
    {
      label: getContextualTranslation(
        'assessmentDetail.paymentDetail.paymentDate',
        'commons.paymentdate'
      ),
      value: data?.paymentDateTime
        ? new Date(data.paymentDateTime).toLocaleDateString('it-IT')
        : '-'
    },
    {
      label: getContextualTranslation(
        'assessmentDetail.paymentDetail.psp',
        'commons.auditor'
      ),
      value: data?.pspCompanyName || '-'
    },
    {
      label: getContextualTranslation(
        'assessmentDetail.paymentDetail.iud',
        'commons.iud'
      ),
      value: data?.iud || '-'
    },
    {
      label: getContextualTranslation(
        'assessmentDetail.paymentDetail.iur',
        'commons.iur'
      ),
      value: data?.iur || '-'
    }
  ];

  const getReceiptPdfMutation = getReceiptPdf(organizationId);
  const handleDownloadReceiptPdf = async () => {
    try {
      const result = await getReceiptPdfMutation.mutateAsync(id);
      const { data, fileName } = result;
      downloadBlob(data, fileName);
    } catch (error) {
      console.error(error);
      utils.notify.emit(t('commons.files.downloadFailed'), 'error');
    }
  };

  // Determine the title based on the context (assessment vs telematic receipt)
  const getPageTitle = () => {
    if (params.assessmentDetailId) {
      return t('assessmentDetail.paymentDetail.title');
    }
    return t('telematicReceiptDetail.title');
  };

  const shouldShowDownloadButton = !params.assessmentDetailId;

  return (
    <>
      <TitleComponent
        title={getPageTitle()}
        callToAction={
          shouldShowDownloadButton
            ? [
                {
                  icon: <Download />,
                  variant: 'contained',
                  buttonText: t('commons.files.download'),
                  onActionClick: handleDownloadReceiptPdf
                }
              ]
            : []
        }
      />
      {
        <Grid container spacing={3}>
          <Grid item md={6}>
            <DetailContainer
              sections={[
                {
                  title: {
                    label: getContextualTranslation(
                      'assessmentDetail.paymentDetail.summary',
                      'commons.summary'
                    ),
                    variant: 'overline'
                  },
                  data: summaryData
                }
              ]}
            />
          </Grid>
          <Grid item md={6}>
            <DetailContainer
              sections={[
                {
                  title: {
                    label: getContextualTranslation(
                      'assessmentDetail.paymentDetail.paymentInfo',
                      'commons.payment'
                    ),
                    variant: 'overline'
                  },
                  data: paymentData
                }
              ]}
            />
          </Grid>
        </Grid>
      }
    </>
  );
};

export default TelematicReceiptDetail;
