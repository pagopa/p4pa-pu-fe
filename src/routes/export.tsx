import ClassificationExport from './ClassificationExport/ClassificationExport';
import { RouteHandleObject } from '../models/Routes';
import ExportFlow from './ExportFlowPage/ExportFlowPage';

export const exportRoutes = [
  {
    id: 'EXPORT',
    path: `export/`,
    children: [
      {
        id: 'EXPORT_FLOWS',
        path: 'flows/:category',
        element: <ExportFlow />,
        handle: {
          backButton: true,
          hideBreadcrumbs: true,
          sidebar: {
            visible: false
          }
        } as RouteHandleObject
      },
      {
        id: 'EXPORT_CLASSIFICATIONS',
        path: 'classifications',
        element: <ClassificationExport />,
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
