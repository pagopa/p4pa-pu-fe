import config from '../utils/config';
import { Layout } from '../components/layout/Layout';
import { RouteHandleObject } from '../models/Routes';
import { Classifications } from '../components/Classifications';

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
      }
    ]
  }
];
