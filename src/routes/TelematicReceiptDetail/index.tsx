import { Download } from '@mui/icons-material';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useNavigate } from 'react-router';
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

export const TelematicReceiptDetail = () => {
  const { t } = useTranslation();
  const { state } = useStore();
  const navigate = useNavigate();

  const id = useLoaderData();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const { data, isError, error } = getReceiptDetail(organizationId, Number(id));

  useEffect(() => {
    if (isNaN(Number(id))) {
      navigate(PageRoutes.RESPONSES_ERROR);
      return;
    }
    if (isError && error) {
      console.error('Error loading receipt detail:', error);
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  }, [id, isError, error, navigate]);

  if (isNaN(Number(id))) {
    return null;
  }

  const debtorType: string =
    data?.debtor.entityType == 'F' ? `(${t('commons.person')})` : '';

  const summaryData: Array<DetailData> = [
    {
      label: t('commons.iuv'),
      value: data?.iuv || ''
    },
    {
      label: t('commons.amount'),
      value: (data?.paymentAmountCents as number) || 0
    },
    {
      label: t('commons.reason'),
      value: data?.debtPositionTypeOrgDescription || ''
    },
    {
      label: t('commons.duetype'),
      value: data?.remittanceInformation || ''
    },
    {
      label: t('commons.debtor'),
      value: data?.debtor.fullName || ''
    },
    {
      label: t('commons.fiscalCodeorVat'),
      value: `${data?.debtor.fiscalCode || ''} ${debtorType}`
    }
  ];

  const paymentData: Array<DetailData> = [
    {
      label: t('commons.paymentdate'),
      value: data?.paymentDateTime
        ? new Date(data.paymentDateTime).toLocaleDateString('it-IT')
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

  return (
    <>
      <TitleComponent
        title={t('telematicReceiptDetail.title')}
        callToAction={[
          {
            icon: <Download />,
            variant: 'contained',
            buttonText: t('commons.files.download'),
            onActionClick: handleDownloadReceiptPdf
          }
        ]}
      />
      {
        <Grid container spacing={3}>
          <Grid item md={6}>
            <DetailContainer
              sections={[
                {
                  title: {
                    label: t('commons.summary'),
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
                    label: t('commons.payment'),
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
