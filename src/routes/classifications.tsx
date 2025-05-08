import config from '../utils/config';
import { Layout } from '../components/layout/Layout';
import { RouteHandleObject } from '../models/Routes';
import { Classifications } from '../components/Classifications';
import ClassificationsOverview from './ClassificationsOverview';

const deployPath = config.deployPath;

export const classificationsRoutes = [
  {
    id: 'CLASSIFICATIONS',
    path: `${deployPath}/classifications/`,
    element: <Layout />,
    children: [
      {
        index: true,
        id: 'CLASSIFICATIONS_INDEX',
        element: <Classifications />,
        handle: {
          backButton: false,
          hideBreadcrumbs: true
        } as RouteHandleObject
      },
      {
        id: 'CLASSIFICATIONS_SEARCH_RESULTS',
        path: 'search-results',
        element: <ClassificationsOverview />,
        handle: {
          backButton: true
        } as RouteHandleObject
      }
    ]
  }
];
