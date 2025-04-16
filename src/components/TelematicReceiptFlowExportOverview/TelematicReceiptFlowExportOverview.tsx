import { useTranslation } from 'react-i18next';
import { ExportFileTypeEnum } from '../../../generated/apiClient';
import ExportFlowOverview from '../ExportFlowOverview/ExportFlowOverview';

const TelematicReceiptExportFlowOverview = () => {
  const { t } = useTranslation();

  return (
    <ExportFlowOverview
      routingCategory="receipt"
      title={t('commons.exportedFlows')}
      description={t('telematicReceiptFlowExportOverview.description')}
      exportFileTypes={ExportFileTypeEnum.PAID}
    />
  );
};

export default TelematicReceiptExportFlowOverview;
