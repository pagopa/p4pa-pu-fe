import { Download } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { useStore } from '../../store/GlobalStore';
import { getReceiptPdf } from '../../api/receiptPdf';
import utils from '../../utils';
import { downloadBlob } from '../../utils/download';
import { PageRoutes } from '../../routes';
import ReceiptDetail from '../../components/ReceiptDetail';
import { useReceiptDetail } from '../../hooks/useReceiptDetail';

export const TelematicReceiptDetail = () => {
  const { t } = useTranslation();
  const {
    state: { organizationId }
  } = useStore();
  const navigate = useNavigate();
  const params = useParams();

  const { receiptId: receiptIdString } = params;
  const receiptId = Number(receiptIdString);

  if (isNaN(receiptId)) {
    navigate(PageRoutes.RESPONSES_ERROR);
  }

  const { paymentData, summaryData } = useReceiptDetail(
    organizationId,
    receiptId
  );

  const getReceiptPdfMutation = getReceiptPdf(organizationId);
  const handleDownloadReceiptPdf = async () => {
    try {
      const result = await getReceiptPdfMutation.mutateAsync(receiptId);
      const { data, fileName } = result;
      downloadBlob(data, fileName);
    } catch (error) {
      console.error(error);
      utils.notify.emit(t('commons.files.downloadFailed'), 'error');
    }
  };

  return (
    <ReceiptDetail
      summaryData={summaryData}
      paymentData={paymentData}
      callToAction={{
        icon: <Download />,
        variant: 'contained',
        buttonText: t('commons.files.download'),
        onActionClick: handleDownloadReceiptPdf
      }}
      pageTitle={t('telematicReceiptDetail.title')}
      accessibleTitle={t('telematicReceiptDetail.title')}
    />
  );
};
