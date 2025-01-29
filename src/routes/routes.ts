import config from '../utils/config';

const deployPath = config.deployPath;

export const PageRoutes = {
  HOME: `${deployPath}/home`,
  TELEMATIC_RECEIPT: `${deployPath}/flows/telematic-receipt`,
  TELEMATIC_RECEIPT_EXPORT_OVERVIEW: `${deployPath}/flows/telematic-receipt/export-overview`,
  TELEMATIC_RECEIPT_SEARCH_RESULTS: `${deployPath}/flows/telematic-receipt/search-results`,
  TELEMATIC_RECEIPT_DETAIL: `${deployPath}/flows/telematic-receipt/search-results/detail`,
  TELEMATIC_RECEIPT_EXPORT_FLOW_RESERVATION: `${deployPath}/flows/telematic-receipt/export-overview/export-flow-reservation`,
  TELEMATIC_RECEIPT_EXPORT_FLOW_THANK_YOU_PAGE: `${deployPath}/flows/telematic-receipt/export-overview/export-flow-thank-you-page`,
  TELEMATIC_RECEIPT_IMPORT_FLOW: `${deployPath}/flows/telematic-receipt/import-flow`,
  TELEMATIC_RECEIPT_IMPORT_FLOW_THANK_YOU_PAGE: `${deployPath}/flows/telematic-receipt/import-flow/import-flow-thank-you-page`,
  TELEMATIC_RECEIPT_IMPORT_OVERVIEW: `${deployPath}/flows/telematic-receipt/import-overview`,
  REPORTING: `${deployPath}/flows/reporting/`,
  REPORTING_SEARCH_RESULTS: `${deployPath}/flows/reporting/search-results`
};
