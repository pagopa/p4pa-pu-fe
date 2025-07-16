import { RouteHandleObject } from '../models/Routes';
import Assessment from '../components/Assessment';
import AssessmentSearchResults from './AssessmentSearchResults';
import AssessmentDetail from './AssessmentDetail/AssessmentDetail';
import { AssessmentsRegistrySearchResults } from './AssessmentsRegistrySearchResults';
import { AssessmentCreate } from './AssessmentCreate/AssessmentCreate';

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
        id: 'ASSESSMENT_CREATION',
        path: 'create',
        element: <AssessmentCreate />,
        handle: {
          backButton: true,
          hideBreadcrumbs: true,
          sidebar: {
            visible: false
          }
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
          hideBreadcrumbs: false,
          custom: true
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
