import config from '../utils/config';

const deployPath = config.deployPath;

export const PageRoutes = {
  HOME: `${deployPath}/home`,
  TELEMATIC_RECEIPT: `${deployPath}/flows/telematic-receipt`,
  TELEMATIC_RECEIPT_EXPORT_OVERVIEW: `${deployPath}/flows/telematic-receipt/export-overview`,
  TELEMATIC_RECEIPT_SEARCH_RESULTS: `${deployPath}/flows/telematic-receipt/search-results`,
  TELEMATIC_RECEIPT_EXPORT_FLOW_RESERVATION: `${deployPath}/flows/telematic-receipt/export-overview/export-flow-reservation`
};
