import { useTranslation } from 'react-i18next';
import { FlowFileType } from '../../models/Filters';
import ImportFlowOverview from '../ImportFlowOverview/ImportFlowOverview';


const TelematicReceiptImportFlowOverview = () => {
  const { t } = useTranslation();

  return (
    <ImportFlowOverview
      routingCategory="telematic-receipt"
      title={t('commons.routes.TELEMATIC_RECEIPT_IMPORT_OVERVIEW')}
      description={t('telematicReceiptImportFlowOverview.description')}
      flowFileTypes={[FlowFileType.RECEIPT, FlowFileType.RECEIPT_PAGOPA]}
    />
  );
};

export default TelematicReceiptImportFlowOverview;
