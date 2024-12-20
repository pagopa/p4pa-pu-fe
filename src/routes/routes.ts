import config from '../utils/config';

const deployPath = config.deployPath;

export const PageRoutes = {
  HOME: `${deployPath}/home`,
  TELEMATIC_RECEIPT_EXPORT: `${deployPath}/flows/telematic-receipt/export`
};
