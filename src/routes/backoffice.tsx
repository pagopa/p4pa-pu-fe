import config from '../utils/config';
import TaxonomyPage from './Taxonomy';
import { RouteHandleObject } from '../models/Routes';
import TaxonomyDetailPage from './TaxonomyDetail';
import { Navigate, Outlet } from 'react-router';
import { SuperAdminRouteGuard } from '../components/RouteGuard/RouteGuard';
import TaxonomySearchResults from './TaxonomySearchResults';
import { RegistryDetailPage } from './RegistryDetailPage/RegistryDetailPage';
import EventPage from './Events';

const deployPath = config.deployPath;

export const backofficeRoutes = [
  {
    id: 'BACKOFFICE',
    path: `backoffice/`,
    element: (
      <SuperAdminRouteGuard>
        <Outlet />
      </SuperAdminRouteGuard>
    ),
    children: [
      {
        element: <Navigate replace to={`${deployPath}/`} />,
        index: true
      },
      {
        id: 'BACKOFFICE_TAXONOMY',
        path: 'taxonomy/',
        children: [
          {
            id: 'BACKOFFICE_TAXONOMY_INDEX',
            element: <TaxonomyPage />,
            index: true,
            handle: {
              hideBreadcrumbs: true,
              backButton: false
            }
          },
          {
            id: 'BACKOFFICE_TAXONOMY_DETAIL',
            path: ':taxonomyId',
            element: <TaxonomyDetailPage />,
            handle: {
              backButton: true
            }
          },
          {
            id: 'BACKOFFICE_TAXONOMY_SEARCH_RESULTS',
            path: 'search-results',
            element: <TaxonomySearchResults />,
            handle: {
              backButton: true
            }
          }
        ]
      },
      {
        id: 'BACKOFFICE_EVENTS',
        path: 'events/',
        children: [
          {
            id: 'BACKOFFICE_EVENTS_INDEX',
            element: <EventPage />,
            index: true,
            handle: {
              hideBreadcrumbs: true,
              backButton: false
            } as RouteHandleObject
          },
          {
            id: 'BACKOFFICE_REGISTRY_LIST',
            path: ':registryType',
            element: <>insert list component here</>,
            handle: {
              backButton: true
            },
            children: [
              {
                id: 'BACKOFFICE_REGISTRY_DETAIL',
                path: ':registryId',
                element: <RegistryDetailPage />,
                handle: {
                  backButton: true
                }
              }
            ]
          }
        ]
      }
    ]
  }
];
