import { RouteHandleObject } from '../models/Routes';
import ImportFlow from './ImportFlowPage';

export const importRoutes = [
  {
    id: 'IMPORT',
    path: `import/`,
    children: [
      {
        id: 'IMPORT_FLOWS',
        path: 'flows/:category',
        element: <ImportFlow />,
        handle: {
          backButton: true,
          hideBreadcrumbs: true,
          sidebar: {
            visible: false
          }
        } as RouteHandleObject
      }
    ]
  }
];
