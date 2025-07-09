import { RouteHandleObject } from '../models/Routes';
import Assessment from '../components/Assessment';

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
      }
    ]
  }
];
