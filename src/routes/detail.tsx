import { Layout } from '../components/layout/Layout';
import { RouteHandleObject } from '../models/Breadcrumbs';
import config from '../utils/config';
import DetailFlowPage from './DetailFlowPage';

const deployPath = config.deployPath;

export const detailRoutes = [
  {
    id: 'DETAIL',
    path: `${deployPath}/detail/`,
    element: <Layout />,
    children: [
      {
        id: 'DETAIL_FLOWS',
        path: 'flows/:category',
        element: <DetailFlowPage />,
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