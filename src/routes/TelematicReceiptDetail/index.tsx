import { Download } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router';
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
  const [searchParams] = useSearchParams();
  const { downloadReceipt } = useReceiptDownload();

  const { receiptId: receiptIdString } = params;
  const receiptId = Number(receiptIdString);

  const iud = searchParams.get('iud') ?? undefined;

  if (isNaN(receiptId) || !iud) {
    navigate(PageRoutes.RESPONSES_ERROR);
    return null;
  }

  const { paymentData, summaryData } = useReceiptDetail(
    organizationId,
    receiptId,
    { iud }
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
