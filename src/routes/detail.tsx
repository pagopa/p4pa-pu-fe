import DebtPositionDetail from '../components/DebtPositionDetail/DebtPositionDetail';
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
        } as RouteHandleObject,
      },
      {
        id: 'DETAIL_DEBT_POSITION',
        path: 'debt-position/:id',
        element: <DebtPositionDetail />,
        handle: {
          backButton: true,
        } as RouteHandleObject,
      }
    ]
  }
];
