import { useTranslation } from 'react-i18next';
import ImportFlowOverview from '../ImportFlowOverview/ImportFlowOverview';
import { IngestionFlowFileTypeEnum } from '../../../generated/core/client';

export const DebtPositionsImportOverview = () => {
  const { t } = useTranslation();

  return (
    <ImportFlowOverview
      routingCategory="debt-positions"
      title={t('commons.debtFlow')}
      accessibleTitle={t('debtPositionsImportFlowOverview.accessibleTitle')}
      ingestionFlowFileTypes={[IngestionFlowFileTypeEnum.DP_INSTALLMENTS]}
    />
  );
};

export default DebtPositionsImportOverview;
