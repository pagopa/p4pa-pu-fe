import { RouteHandleObject } from '../models/Routes';
import Assessment from '../components/Assessment';
import { AssessmentsRegistrySearchResults } from './AssessmentsRegistrySearchResults';

export const assessmentRoutes = [
  {
    id: 'ASSESSMENT',
    path: `assessment/`,
    children: [
      {
        index: true,
        id: 'ASSESSMENT_INDEX',
        element: <Assessment />,
        handle: {
          backButton: false,
          hideBreadcrumbs: true
        } as RouteHandleObject
      },
      {
        path: 'registry/search-results/',
        id: 'ASSESSMENT_REGISTRY_SEARCH_RESULTS',
        children: [
          {
            id: 'ASSESSMENT_REGISTRY_SEARCH_RESULTS_INDEX',
            index: true,
            element: <AssessmentsRegistrySearchResults />,
            handle: {
              backButton: true,
              hideBreadcrumbs: false,
              hideBreadcrumbElement: true
            } as RouteHandleObject
          }
        ]
      }
    ]
  }
];
