import { RouteHandleObject } from '../models/Routes';
import Assessment from '../components/Assessment';
import AssessmentSearchResults from './AssessmentSearchResults';

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
        id: 'ASSESSMENT_SEARCH_RESULTS',
        path: 'search-results',
        element: <AssessmentSearchResults />,
        handle: {
          backButton: true,
          hideBreadcrumbs: false
        } as RouteHandleObject
      }
    ]
  }
];
