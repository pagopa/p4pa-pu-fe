import { useTranslation } from 'react-i18next';
import { ExportFileTypeEnum } from '../../../generated/apiClient';
import ExportFlowOverview from '../ExportFlowOverview/ExportFlowOverview';

const ClassificationsOverview = () => {
  const { t } = useTranslation();

  return (
    <ExportFlowOverview
      routingCategory=""
      title={t('commons.routes.CLASSIFICATIONS')}
      description={t('classifications.description')}
      sectionTitle={t('classifications.sectionTitle')}
      exportFileTypes={ExportFileTypeEnum.CLASSIFICATIONS}
    />
  );
};

export default ClassificationsOverview;
