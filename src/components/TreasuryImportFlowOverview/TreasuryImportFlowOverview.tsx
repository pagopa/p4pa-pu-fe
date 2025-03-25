import { useTranslation } from 'react-i18next';

import ImportFlowOverview from '../ImportFlowOverview/ImportFlowOverview';
import { GetIngestionFlowFilesParamsFlowFileTypesEnum } from '../../../generated/apiClient';

export const TreasuryImportFlowOverview = () => {
  const { t } = useTranslation();

  return (
    <ImportFlowOverview
      routingCategory="treasury"
      title={t('commons.routes.TREASURY_IMPORT_FLOW_OVERVIEW')}
      description={t('treasuryImportFlowOverview.description')}
      flowFileTypes={[
        GetIngestionFlowFilesParamsFlowFileTypesEnum.TREASURY_CSV,
        GetIngestionFlowFilesParamsFlowFileTypesEnum.TREASURY_OPI,
        GetIngestionFlowFilesParamsFlowFileTypesEnum.TREASURY_POSTE,
        GetIngestionFlowFilesParamsFlowFileTypesEnum.TREASURY_XLS
      ]}
    />
  );
};

export default TreasuryImportFlowOverview;
