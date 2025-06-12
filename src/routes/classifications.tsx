import { RouteHandleObject } from '../models/Routes';
import { Classifications } from '../components/Classifications';
import ClassificationsOverview from './ClassificationsOverview';
import ClassificationDetails from '../components/ClassificationDetail';

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
        id: 'CLASSIFICATIONS_EXPORT_OVERVIEW',
        path: 'export-overview',
        element: <ClassificationsOverview />,
        handle: {
          backButton: true
        } as RouteHandleObject
      },
      {
        path: 'search-results',
        id: 'CLASSIFICATIONS_SEARCH_RESULTS',
        children: [
          {
            id: 'CLASSIFICATIONS_SEARCH_RESULTS_INDEX',
            index: true,
            element: <ClassificationsOverview />,
            handle: {
              backButton: true,
              hideBreadcrumbs: false,
              hideBreadcrumbElement: true
            } as RouteHandleObject
          },
          {
            id: 'CLASSIFICATION_DETAIL',
            path: ':classificationId',
            element: <ClassificationDetails />,
            handle: {
              backButton: true,
              hideBreadcrumbs: false
            } as RouteHandleObject
          }
        ]
      }
    ]
  }
];
