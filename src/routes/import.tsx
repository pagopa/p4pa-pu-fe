import { Layout } from '../components/layout/Layout';
import { RouteHandleObject } from '../models/Breadcrumbs';
import config from '../utils/config';
import ImportFlow from './ImportFlowPage';

const deployPath = config.deployPath;

export const importRoutes = [
  {
    id: 'IMPORT',
    path: `${deployPath}/import/`,
    element: <Layout />,
    children: [
      {
        id: 'IMPORT_FLOWS',
        path: 'flows/:category',
        element: <ImportFlow />,
        handle: {
          backButton: true,
          hideBreadcrumbs: true,
          sidebar: {
            visible: false
          }
        } as RouteHandleObject,
      }
    ]
  }
];