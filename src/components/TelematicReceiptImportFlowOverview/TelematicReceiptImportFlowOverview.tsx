import { useTranslation } from 'react-i18next';
import ImportFlowOverview from '../ImportFlowOverview/ImportFlowOverview';
import { IngestionFlowFileTypeEnum } from '../../../generated/apiClient';

const TelematicReceiptImportFlowOverview = () => {
  const { t } = useTranslation();

  return (
    <ImportFlowOverview
      routingCategory="telematic-receipt"
      title={t('commons.routes.TELEMATIC_RECEIPT_IMPORT_OVERVIEW')}
      description={t('telematicReceiptImportFlowOverview.description')}
      ingestionFlowFileTypes={[
        IngestionFlowFileTypeEnum.RECEIPT,
        IngestionFlowFileTypeEnum.RECEIPT_PAGOPA
      ]}
      accessibleTitle={t('telematicReceiptImportFlowOverview.accessibleTitle')}
    />
  );
};

export default TelematicReceiptImportFlowOverview;
