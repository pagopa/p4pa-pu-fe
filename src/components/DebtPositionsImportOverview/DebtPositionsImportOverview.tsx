import { useTranslation } from 'react-i18next';
import ImportFlowOverview from '../ImportFlowOverview/ImportFlowOverview';
import { FlowFileType } from '../../models/Filters';

export const DebtPositionsImportOverview = () => {
  const { t } = useTranslation();

  return (
    <ImportFlowOverview
      routingCategory="debt-positions"
      title={t('commons.debtFlow')}
      flowFileTypes={[FlowFileType.DP_INSTALLMENTS]}
    />
  );
};

export default DebtPositionsImportOverview;
