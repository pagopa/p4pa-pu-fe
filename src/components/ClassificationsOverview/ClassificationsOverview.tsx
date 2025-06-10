import { useTranslation } from 'react-i18next';
import { ExportFileTypeEnum } from '../../../generated/apiClient';
import ExportFlowOverview from '../ExportFlowOverview/ExportFlowOverview';
import { PageRoutes } from '../../routes';

const ClassificationsOverview = () => {
  const { t } = useTranslation();

  return (
    <ExportFlowOverview
      routingCategory=""
      title={t('commons.exportedFlows')}
      description={t('classifications.description')}
      exportFileTypes={ExportFileTypeEnum.CLASSIFICATIONS}
      specializedExportPage={PageRoutes.EXPORT_CLASSIFICATIONS}
    />
  );
};

export default ClassificationsOverview;
