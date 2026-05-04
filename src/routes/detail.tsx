import { RouteHandleObject } from '../models/Routes';
import DetailFlowPage from './DetailFlowPage';

export const detailRoutes = [
  {
    id: 'DETAIL',
    path: `detail/`,
    children: [
      {
        id: 'DETAIL_FLOWS',
        path: 'flows/:category',
        element: <DetailFlowPage />,
        handle: {
          backButton: true
        } as RouteHandleObject
      }
    ]
  }
];
