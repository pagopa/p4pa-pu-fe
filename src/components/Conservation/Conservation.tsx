import { useTranslation } from 'react-i18next';
import { ExportFileTypeEnum } from '../../../generated/core/client';
import ExportFlowOverview from '../ExportFlowOverview/ExportFlowOverview';

const Conservation = () => {
  const { t } = useTranslation();

  return (
    <ExportFlowOverview
      routingCategory="conservation"
      title={t('commons.routes.CONSERVATION')}
      description={t('conservation.description')}
      sectionTitle={t('commons.exportedFlows')}
      exportFileTypes={ExportFileTypeEnum.RECEIPTS_ARCHIVING}
    />
  );
};

export default Conservation;
