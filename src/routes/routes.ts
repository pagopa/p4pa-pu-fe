import config from '../utils/config';

const deployPath = config.deployPath;

export const PageRoutes = {
  HOME: `${deployPath}/home`,
  TELEMATIC_RECEIPT: `${deployPath}/flows/telematic-receipt`,
  TELEMATIC_RECEIPT_EXPORT_OVERVIEW: `${deployPath}/flows/telematic-receipt/export-overview`,
  EXPORT_FLOW_RESERVATION: `${deployPath}/flows/telematic-receipt/export-overview/export-flow-reservation`
};
