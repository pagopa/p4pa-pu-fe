import { useTranslation } from 'react-i18next';
import ImportFlowOverview from '../ImportFlowOverview/ImportFlowOverview';
import { IngestionFlowFileTypeEnum } from '../../../generated/core/client';

export const ReportingImportFlowOverview = () => {
  const { t } = useTranslation();

  return (
    <ImportFlowOverview
      routingCategory="reporting"
      title={t('commons.routes.REPORTING_IMPORT_FLOW_OVERVIEW')}
      description={t('reportingImportFlowOverview.description')}
      ingestionFlowFileTypes={[
        IngestionFlowFileTypeEnum.PAYMENTS_REPORTING,
        IngestionFlowFileTypeEnum.PAYMENTS_REPORTING_PAGOPA
      ]}
      accessibleTitle={t('reportingImportFlowOverview.accessibleTitle')}
    />
  );
};

export default ReportingImportFlowOverview;
