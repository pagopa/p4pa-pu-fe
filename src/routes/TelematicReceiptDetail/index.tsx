import { Download } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { useStore } from '../../store/GlobalStore';
import { PageRoutes } from '../../routes';
import ReceiptDetail from '../../components/ReceiptDetail';
import { useReceiptDetail } from '../../hooks/useReceiptDetail';
import { useReceiptDownload } from './useReceiptDownload';

export const TelematicReceiptDetail = () => {
  const { t } = useTranslation();
  const {
    state: { organizationId }
  } = useStore();
  const navigate = useNavigate();
  const params = useParams();
  const { downloadReceipt } = useReceiptDownload();

  const { receiptId: receiptIdString } = params;
  const receiptId = Number(receiptIdString);

  if (isNaN(receiptId)) {
    navigate(PageRoutes.RESPONSES_ERROR);
  }

  const { paymentData, summaryData } = useReceiptDetail(
    organizationId,
    receiptId
  );

  const onActionClick = () => downloadReceipt({ receiptId });

  return (
    <ReceiptDetail
      summaryData={summaryData}
      paymentData={paymentData}
      callToAction={{
        icon: <Download />,
        variant: 'contained',
        buttonText: t('commons.files.download'),
        onActionClick
      }}
      pageTitle={t('telematicReceiptDetail.title')}
      accessibleTitle={t('telematicReceiptDetail.title')}
    />
  );
};
