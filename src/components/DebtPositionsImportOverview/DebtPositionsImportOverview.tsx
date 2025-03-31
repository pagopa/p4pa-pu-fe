import { useTranslation } from 'react-i18next';
import ImportFlowOverview from '../ImportFlowOverview/ImportFlowOverview';
import { IngestionFlowFileTypeEnum } from '../../../generated/apiClient';

export const DebtPositionsImportOverview = () => {
  const { t } = useTranslation();

  return (
    <ImportFlowOverview
      routingCategory="debt-positions"
      title={t('commons.debtFlow')}
      ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.DP_INSTALLMENTS]}
    />
  );
};

export default DebtPositionsImportOverview;
