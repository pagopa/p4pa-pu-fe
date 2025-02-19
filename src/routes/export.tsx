import { Layout } from '../components/layout/Layout';
import { RouteHandleObject } from '../models/Breadcrumbs';
import config from '../utils/config';
import ExportFlow from './ExportFlowPage/ExportFlowPage';

const deployPath = config.deployPath;

export const exportRoutes = [
  {
    id: 'EXPORT',
    path: `${deployPath}/export/`,
    element: <Layout />,
    children: [
      {
        id: 'EXPORT_FLOWS',
        path: 'flows/:category',
        element: <ExportFlow />,
        handle: {
          backButton: true,
          sidebar: {
            visible: false,
            omitBreadcrumbs: true,
          }
        } as RouteHandleObject,
      }
    ]
  }
];