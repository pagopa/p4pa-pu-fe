import config from '../utils/config';

const deployPath = config.deployPath;

export const PageRoutes = {
  HOME: `${deployPath}/home`,
  TELEMATIC_RECEIPT: `${deployPath}/flows/telematic-receipt`
};
