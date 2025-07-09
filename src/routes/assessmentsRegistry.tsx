import { RouteHandleObject } from '../models/Routes';
import { AssessmentsRegistrySearchResults } from './AssessmentsRegistrySearchResults';

export const assessmentRegistryRoutes = [
  {
    id: 'ASSESSMENT',
    path: `assessment/`,
    children: [
      {
        path: 'search-results/',
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
