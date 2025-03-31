import { useTranslation } from 'react-i18next';

import ImportFlowOverview from '../ImportFlowOverview/ImportFlowOverview';
import { IngestionFlowFileTypeEnum } from '../../../generated/apiClient';

export const TreasuryImportFlowOverview = () => {
  const { t } = useTranslation();

  return (
    <ImportFlowOverview
      routingCategory="treasury"
      title={t('commons.routes.TREASURY_IMPORT_FLOW_OVERVIEW')}
      description={t('treasuryImportFlowOverview.description')}
      ingestionFlowFileTypes={[
        IngestionFlowFileTypeEnum.TREASURY_CSV,
        IngestionFlowFileTypeEnum.TREASURY_OPI,
        IngestionFlowFileTypeEnum.TREASURY_POSTE,
        IngestionFlowFileTypeEnum.TREASURY_XLS
      ]}
    />
  );
};

export default TreasuryImportFlowOverview;
