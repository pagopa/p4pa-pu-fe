import { useTranslation } from 'react-i18next';
import { getReceiptPdf } from '../../api/receiptPdf';
import { useStore } from '../../store/GlobalStore';
import { downloadBlob } from '../../utils/download';
import notify from '../../utils/notify';

export const useReceiptDownload = () => {
  const { t } = useTranslation();
  const {
    state: { organizationId }
  } = useStore();
  const getReceiptPdfMutation = getReceiptPdf(organizationId);

  const downloadReceipt = async ({ receiptId }: { receiptId: number }) => {
    try {
      const result = await getReceiptPdfMutation.mutateAsync(receiptId);
      const { data, fileName } = result;
      downloadBlob(data, fileName);
    } catch (error) {
      console.error(error);
      notify.emit(t('commons.files.downloadFailed'), 'error');
    }
  };

  return {
    downloadReceipt
  };
};
