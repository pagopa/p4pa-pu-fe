import { useTranslation } from 'react-i18next';
import ImportFlowOverview from '../ImportFlowOverview/ImportFlowOverview';
import { GetIngestionFlowFilesParamsFlowFileTypesEnum } from '../../../generated/apiClient';

export const ReportingImportFlowOverview = () => {
  const { t } = useTranslation();

  return (
    <ImportFlowOverview
      routingCategory="reporting"
      title={t('commons.routes.REPORTING_IMPORT_FLOW_OVERVIEW')}
      description={t('reportingImportFlowOverview.description')}
      flowFileTypes={[
        GetIngestionFlowFilesParamsFlowFileTypesEnum.PAYMENTS_REPORTING,
        GetIngestionFlowFilesParamsFlowFileTypesEnum.PAYMENTS_REPORTING_PAGOPA
      ]}
    />
  );
};

export default ReportingImportFlowOverview;
