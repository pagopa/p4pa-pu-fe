import config from '../utils/config';
import { Layout } from '../components/layout/Layout';
import TaxonomyPage from './Taxonomy';
import { RouteHandleObject } from '../models/Routes';
import TaxonomyDetailPage from './TaxonomyDetail';
import { Navigate } from 'react-router-dom';
import { SuperAdminRouteGuard } from '../components/RouteGuard/RouteGuard';

const deployPath = config.deployPath;

export const backofficeRoutes = [
  {
    id: 'BACKOFFICE',
    path: `${deployPath}/backoffice/`,
    children: [
      {
        element: <Navigate replace to={`${deployPath}/`} />,
        index: true
      },
      {
        id: 'BACKOFFICE_TAXONOMY',
        path: 'taxonomy/',
        element: <SuperAdminRouteGuard><Layout /></SuperAdminRouteGuard>,
        children: [
          {
            id: 'BACKOFFICE_TAXONOMY_INDEX',
            element: <TaxonomyPage />,
            index: true,
            handle: {
              hideBreadcrumbs: true,
              backButton: false
            } as RouteHandleObject
          },
          {
            id: 'BACKOFFICE_TAXONOMY_DETAIL',
            path: ':taxonomyId',
            element: <TaxonomyDetailPage />,
            handle: {
              backButton: true
            } as RouteHandleObject
          }
        ]
      }
    ]
  }
];
