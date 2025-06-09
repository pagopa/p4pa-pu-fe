import config from '../utils/config';
import TaxonomyPage from './Taxonomy';
import { RouteHandleObject } from '../models/Routes';
import TaxonomyDetailPage from './TaxonomyDetail';
import { Navigate, Outlet } from 'react-router-dom';
import { SuperAdminRouteGuard } from '../components/RouteGuard/RouteGuard';
import TaxonomySearchResults from './TaxonomySearchResults';

const deployPath = config.deployPath;

export const backofficeRoutes = [
  {
    id: 'BACKOFFICE',
    path: `backoffice/`,
    children: [
      {
        element: <Navigate replace to={`${deployPath}/`} />,
        index: true
      },
      {
        id: 'BACKOFFICE_TAXONOMY',
        path: 'taxonomy/',
        element: (
          <SuperAdminRouteGuard>
            <Outlet />
          </SuperAdminRouteGuard>
        ),
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
          },
          {
            id: 'BACKOFFICE_TAXONOMY_SEARCH_RESULTS',
            path: 'search-results',
            element: <TaxonomySearchResults />,
            handle: {
              backButton: true
            } as RouteHandleObject
          }
        ]
      }
    ]
  }
];
