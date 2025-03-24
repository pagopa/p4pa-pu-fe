import { useTranslation } from 'react-i18next';
import ImportFlowOverview from '../ImportFlowOverview/ImportFlowOverview';
import { GetIngestionFlowFilesParamsFlowFileTypesEnum } from '../../../generated/apiClient';

const TelematicReceiptImportFlowOverview = () => {
  const { t } = useTranslation();

  return (
    <ImportFlowOverview
      routingCategory="telematic-receipt"
      title={t('commons.routes.TELEMATIC_RECEIPT_IMPORT_OVERVIEW')}
      description={t('telematicReceiptImportFlowOverview.description')}
      flowFileTypes={[GetIngestionFlowFilesParamsFlowFileTypesEnum.RECEIPT, GetIngestionFlowFilesParamsFlowFileTypesEnum.RECEIPT_PAGOPA]}
    />
  );
};

export default TelematicReceiptImportFlowOverview;
