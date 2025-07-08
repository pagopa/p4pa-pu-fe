import { RouteHandleObject } from '../models/Routes';
import Assessment from '../components/Assessment';
import AssessmentSearchResults from './AssessmentSearchResults';
import AssessmentDetail from './AssessmentDetail/AssessmentDetail';

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
      },
      {
        id: 'ASSESSMENT_DETAIL',
        path: 'detail/:id',
        element: <AssessmentDetail />,
        handle: {
          backButton: true,
          hideBreadcrumbs: false
        } as RouteHandleObject
      }
    ]
  }
];
