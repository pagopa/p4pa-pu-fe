import { RouteHandleObject } from '../models/Routes';
import { Classifications } from '../components/Classifications';
import ClassificationsOverview from './ClassificationsOverview';

export const classificationsRoutes = [
  {
    id: 'CLASSIFICATIONS',
    path: `classifications/`,
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
