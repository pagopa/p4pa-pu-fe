import config from '../utils/config';
import TaxonomyPage from './Taxonomy';
import { RouteHandleObject } from '../models/Routes';
import TaxonomyDetailPage from './TaxonomyDetail';
import { Navigate, Outlet } from 'react-router';
import {
  AdminRouteGuard,
  SuperAdminRouteGuard
} from '../components/RouteGuard/RouteGuard';
import TaxonomySearchResults from './TaxonomySearchResults';
import { RegistryDetailPage } from './RegistryDetailPage/RegistryDetailPage';
import { EventPage } from './Events/Search';
import { EventList } from './Events/List';
import OrgSilServicesPage from './OrgSilServicePage/OrgSilServicesPage';
import OrgSilServiceDetailPage from './OrgSilServiceDetailPage/OrgSilServiceDetailPage';
import ClientSilPage from './ClientSilPage/ClientSilPage';
import ClientSilCreate from './ClientSilCreate/ClientSilCreate';
import { OrgSilServiceCreate } from './OrgSilServiceCreate/OrgSilServiceCreate';
import ClientSilDetail from './ClientSilDetail';
import { OrgSilServiceEdit } from './OrgSilServiceCreate/OrgSilServiceEdit';
import SpontaneousFormPage from './SpontaneousForm/SpontaneousFormPage/SpontaneousFormPage';
import SpontaneousFormDetail from './SpontaneousForm/SpontaneousFormDetail/SpontaneousFormDetail';
import SpontaneousFormCreate from './SpontaneousForm/SpontaneousFormCreate/SpontaneousFormCreate';
import SpontaneousFormEdit from './SpontaneousForm/SpontaneousFormEdit/SpontaneousFormEdit';

const deployPath = config.deployPath;

export const backofficeRoutes = [
  {
    id: 'BACKOFFICE',
    path: `backoffice/`,
    element: <Outlet />,
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
        element: (
          <SuperAdminRouteGuard>
            <Outlet />
          </SuperAdminRouteGuard>
        ),
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
            path: ':registryType/',
            handle: {
              hideBreadcrumbElement: true
            },
            children: [
              {
                id: 'BACKOFFICE_REGISTRY_LIST_INDEX',
                index: true,
                element: <EventList />,
                handle: {
                  backButton: true,
                  hideBreadcrumbElement: true
                } as RouteHandleObject
              },
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
      },
      {
        id: 'ORG_SIL_SERVICE',
        path: 'org-sil-services/',
        element: (
          <AdminRouteGuard>
            <Outlet />
          </AdminRouteGuard>
        ),
        children: [
          {
            id: 'ORG_SIL_SERVICE_INDEX',
            element: <OrgSilServicesPage />,
            index: true,
            handle: {
              hideBreadcrumbs: true,
              backButton: false
            }
          },
          {
            id: 'ORG_SIL_SERVICE_DETAIL',
            path: ':orgSilServiceId',
            element: <OrgSilServiceDetailPage />,
            handle: {
              backButton: true,
              hideBreadcrumbs: false,
              backFallbackRoute: 'ORG_SIL_SERVICE_INDEX',
              sidebar: {
                visible: false
              }
            }
          },
          {
            id: 'ORG_SIL_SERVICE_CREATE',
            path: 'new',
            element: <OrgSilServiceCreate />,
            handle: {
              backButton: true,
              backButtonText: 'commons.exit',
              hideBreadcrumbs: true,
              sidebar: {
                visible: false
              }
            }
          },
          {
            id: 'ORG_SIL_SERVICE_EDIT',
            path: ':orgSilServiceId/edit',
            element: <OrgSilServiceEdit />,
            handle: {
              backButton: true,
              backButtonText: 'commons.exit',
              hideBreadcrumbs: true,
              sidebar: {
                visible: false
              }
            }
          }
        ]
      },
      {
        id: 'CLIENT_SIL',
        path: 'client-sil/',
        element: (
          <AdminRouteGuard>
            <Outlet />
          </AdminRouteGuard>
        ),
        children: [
          {
            id: 'CLIENT_SIL_INDEX',
            element: <ClientSilPage />,
            index: true,
            handle: {
              hideBreadcrumbs: true,
              backButton: false
            }
          },
          {
            id: 'CLIENT_SIL_CREATE',
            path: 'create',
            element: <ClientSilCreate />,
            handle: {
              backButton: true,
              backButtonText: 'commons.exit',
              hideBreadcrumbs: true,
              sidebar: {
                visible: false
              }
            }
          },
          {
            id: 'CLIENT_SIL_DETAIL',
            element: <ClientSilDetail />,
            path: ':clientId',
            handle: {
              hideBreadcrumbs: true,
              backButton: true,
              backFallbackRoute: 'CLIENT_SIL_INDEX',
              sidebar: {
                visible: false
              }
            }
          }
        ]
      },
      {
        id: 'SPONTANEOUS_FORM',
        path: 'spontaneous-form/',
        element: (
          <AdminRouteGuard>
            <Outlet />
          </AdminRouteGuard>
        ),
        children: [
          {
            id: 'SPONTANEOUS_FORM_INDEX',
            element: <SpontaneousFormPage />,
            index: true,
            handle: {
              hideBreadcrumbs: true,
              backButton: false
            }
          },
          {
            id: 'SPONTANEOUS_FORM_DETAIL',
            element: <SpontaneousFormDetail />,
            path: ':spontaneousFormId',
            handle: {
              hideBreadcrumbs: true,
              backButton: true,
              backFallbackRoute: 'SPONTANEOUS_FORM',
              sidebar: {
                visible: false
              }
            }
          },
          {
            id: 'SPONTANEOUS_FORM_CREATE',
            path: 'create',
            element: <SpontaneousFormCreate />,
            handle: {
              backButton: true,
              backButtonText: 'commons.exit',
              hideBreadcrumbs: true,
              sidebar: {
                visible: false
              }
            }
          },
          {
            id: 'SPONTANEOUS_FORM_EDIT',
            path: ':spontaneousFormId/edit',
            element: <SpontaneousFormEdit />,
            handle: {
              backButton: true,
              backButtonText: 'commons.exit',
              hideBreadcrumbs: true,
              sidebar: {
                visible: false
              }
            }
          }
        ]
      }
    ]
  }
];
