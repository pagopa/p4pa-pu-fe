import { useTranslation } from 'react-i18next';
import ImportFlowOverview from '../ImportFlowOverview/ImportFlowOverview';
import { GetIngestionFlowFilesParamsFlowFileTypesEnum } from '../../../generated/apiClient';

export const DebtPositionsImportOverview = () => {
  const { t } = useTranslation();

  return (
    <ImportFlowOverview
      routingCategory="debt-positions"
      title={t('commons.debtFlow')}
      flowFileTypes={[
        GetIngestionFlowFilesParamsFlowFileTypesEnum.DP_INSTALLMENTS
      ]}
    />
  );
};

export default DebtPositionsImportOverview;
