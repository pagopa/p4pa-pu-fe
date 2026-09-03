import { useTranslation } from 'react-i18next';
import { ExportFileTypeEnum } from '../../../generated/core/client';
import ExportFlowOverview from '../ExportFlowOverview/ExportFlowOverview';
import { PageRoutes } from '../../routes';

const ClassificationsExportFlowOverview = () => {
  const { t } = useTranslation();

  return (
    <ExportFlowOverview
      routingCategory="classifications"
      title={t('commons.exportedFlows')}
      description={t('classificationsExport.descriptionOverview')}
      accessibleTitle={t('classificationsExport.accessibleTitle')}
      exportFileTypes={ExportFileTypeEnum.CLASSIFICATIONS}
      specializedExportPage={PageRoutes.EXPORT_CLASSIFICATIONS}
    />
  );
};

export default ClassificationsExportFlowOverview;
