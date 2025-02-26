import { useTranslation } from 'react-i18next';

import ImportFlowOverview from '../ImportFlowOverview/ImportFlowOverview';
import { FlowFileType } from '../../models/Filters';

export const TreasuryImportFlowOverview = () => {
  const { t } = useTranslation();
  
  return (
    <ImportFlowOverview
      routingCategory="treasury"
      title={t('commons.routes.TREASURY_IMPORT_FLOW_OVERVIEW')}
      description={t('treasuryImportFlowOverview.description')}
      flowFileTypes={[FlowFileType.TREASURY_CSV, FlowFileType.TREASURY_OPI, FlowFileType.TREASURY_POSTE, FlowFileType.TREASURY_XLS]}
    />
  );
};

export default TreasuryImportFlowOverview;
