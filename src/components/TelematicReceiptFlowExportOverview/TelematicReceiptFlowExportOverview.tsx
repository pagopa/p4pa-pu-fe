import { useTranslation } from 'react-i18next';
import { ExportFileTypeEnum } from '../../../generated/core/client';
import ExportFlowOverview from '../ExportFlowOverview/ExportFlowOverview';

const TelematicReceiptExportFlowOverview = () => {
  const { t } = useTranslation();

  return (
    <ExportFlowOverview
      routingCategory="receipt"
      title={t('commons.exportedFlows')}
      description={t('telematicReceiptFlowExportOverview.description')}
      accessibleTitle={t('telematicReceiptFlowExportOverview.accessibleTitle')}
      exportFileTypes={ExportFileTypeEnum.PAID}
    />
  );
};

export default TelematicReceiptExportFlowOverview;
