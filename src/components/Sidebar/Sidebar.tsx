import React, { useEffect } from 'react';
import {
  Box,
  Divider,
  Grid,
  IconButton,
  List,
  Typography,
  useTheme,
  Tooltip,
  useMediaQuery,
  type Theme
} from '@mui/material';
import { SidebarMenuItem } from './SidebarMenuItem';
import { useTranslation } from 'react-i18next';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import DomainIcon from '@mui/icons-material/Domain';
import { sidebarStyles } from './sidebar.styles';
import { PageRoutes } from '../../routes';
import { ISidebarMenuItem } from '../../models/SidebarMenuItem';
import useCollapseMenu from '../../hooks/useCollapseMenu';
import { useStore } from '../../store/GlobalStore';
import utils from '../../utils';
import { Dns } from '@mui/icons-material';
import { generatePath } from 'react-router';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const lg = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

  const { collapsed, changeMenuState, setCollapsed, setOverlay, overlay } =
    useCollapseMenu(!lg);

  useEffect(() => {
    setOverlay(!(lg || collapsed));
  }, [lg, collapsed]);
  //This useEffect is needed, otherwise React will complain about the component being re rendered while another re render is in the queue.

  const styles = sidebarStyles(theme, collapsed);

  const RotatedAltRouteIcon = () => {
    return <AltRouteIcon sx={{ transform: 'rotate(90deg)' }} />;
  };
  const { state } = useStore();
  const isSuperAdmin = utils.roles.useIsSuperAdmin();
  const { organizationId, operatorRole } = state;

  const menuItems: Array<ISidebarMenuItem> = [
    {
      label: t('commons.routes.HOME'),
      icon: ViewSidebarIcon,
      route: PageRoutes.HOME,
      end: true
    },
    {
      label: t('commons.routes.DEBT_POSITIONS'),
      icon: ReceiptLongIcon,
      route: PageRoutes.DEBT_POSITIONS,
      end: true
    },
    {
      label: t('commons.routes.FLOWS'),
      icon: RotatedAltRouteIcon,
      end: false,
      items: [
        {
          label: t('commons.routes.TELEMATIC_RECEIPT'),
          route: PageRoutes.TELEMATIC_RECEIPT,
          end: true
        },
        {
          label: t('commons.routes.REPORTING'),
          route: PageRoutes.REPORTING,
          end: true
        },
        {
          label: t('commons.routes.TREASURY'),
          route: PageRoutes.TREASURY,
          end: true
        },
        {
          label: t('commons.routes.CONSERVATION'),
          route: PageRoutes.CONSERVATION,
          end: true
        }
      ]
    },
    {
      label: t('commons.routes.CLASSIFICATIONS'),
      icon: PlaylistAddCheckIcon,
      route: PageRoutes.CLASSIFICATIONS,
      end: true
    },
    {
      label: t('commons.routes.ASSESSMENT'),
      icon: AllInboxIcon,
      route: PageRoutes.ASSESSMENT,
      end: true
    }
  ];

  const additionalItems = [];

  if (isSuperAdmin || operatorRole == 'ROLE_ADMIN') {
    const debtypes = [];

    // Debtypes catalog only for superAdmin
    if (isSuperAdmin) {
      debtypes.push({
        label: t('commons.routes.DEBT_TYPES_CATALOG'),
        route: PageRoutes.DEBT_TYPES_CATALOG,
        end: true
      });
    }

    debtypes.push({
      label: t('commons.routes.DEBT_TYPES_DASHBOARD'),
      route: PageRoutes.DEBT_TYPES_DASHBOARD,
      end: true
    });

    additionalItems.push(
      {
        label: t('commons.routes.ORGANIZATIONS_DETAIL'),
        icon: DomainIcon,
        route: generatePath(PageRoutes.ORGANIZATIONS_DETAIL, {
          organizationId: organizationId
        }),
        end: true
      },
      {
        label: t('commons.routes.OPERATORS_LIST'),
        icon: ManageAccountsIcon,
        route: PageRoutes.OPERATORS_LIST,
        end: true
      },
      {
        label: t('commons.routes.DEBT_TYPES'),
        icon: DashboardIcon,
        end: false,
        items: debtypes
      }
    );

    const commonBackOfficeItems = [
      {
        label: t('commons.routes.CLIENT_SIL'),
        route: PageRoutes.CLIENT_SIL_INDEX,
        end: true
      },
      {
        label: t('commons.routes.ORG_SIL_SERVICE'),
        route: PageRoutes.ORG_SIL_SERVICE_INDEX,
        end: true
      }
    ];

    // BACKOFFICE SECTION
    additionalItems.push({
      label: t('commons.routes.BACKOFFICE'),
      icon: SettingsIcon,
      end: false,
      items: [
        ...(isSuperAdmin
          ? [
              {
                label: t('commons.routes.BACKOFFICE_TAXONOMY'),
                route: PageRoutes.BACKOFFICE_TAXONOMY,
                end: true
              },
              {
                label: t('commons.routes.BACKOFFICE_EVENTS'),
                route: PageRoutes.BACKOFFICE_EVENTS,
                end: true
              },
              ...commonBackOfficeItems
            ]
          : commonBackOfficeItems)
      ]
    });
  }

  return (
    <>
      <Grid
        component={'aside'}
        item
        sx={styles.container}
        lg={collapsed ? 'auto' : 3}
      >
        <Box
          alignItems="normal"
          display="flex"
          flexDirection="column"
          component="nav"
          aria-expanded={!collapsed}
          aria-label={t('commons.sidebar.menu')}
          role="navigation"
          sx={styles.nav}
        >
          {overlay && (
            <Box sx={styles.collapseIcon}>
              <Tooltip
                placement="left"
                title={t(
                  !collapsed
                    ? 'commons.sidebar.collapse'
                    : 'commons.sidebar.expand'
                )}
              >
                <IconButton
                  data-testid="collapseClose"
                  aria-label={t(
                    !collapsed
                      ? 'commons.sidebar.collapse'
                      : 'commons.sidebar.expand'
                  )}
                  onClick={changeMenuState}
                  size="large"
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          {isSuperAdmin && (
            <>
              <List
                sx={styles.list}
                component="ol"
                aria-hidden={collapsed && !lg}
                aria-label={t('commons.sidebar.menudescription')}
              >
                <SidebarMenuItem
                  onClick={() => !lg && setCollapsed(true)}
                  collapsed={collapsed}
                  item={{
                    label: t('commons.routes.ORGANIZATIONS'),
                    icon: Dns,
                    route: PageRoutes.ORGANIZATIONS,
                    end: true
                  }}
                  key="managed-orgs"
                />
              </List>
              <Divider
                orientation="horizontal"
                flexItem
                sx={{ display: lg ? 'block' : 'none' }}
              />
            </>
          )}
          <List
            sx={styles.list}
            component="ol"
            aria-hidden={collapsed && !lg}
            aria-label={t('commons.sidebar.menudescription')}
          >
            {menuItems.map((item, index) => (
              <SidebarMenuItem
                onClick={() => !lg && setCollapsed(true)}
                collapsed={collapsed}
                item={item}
                key={`${item.label}-${index}`}
              />
            ))}
          </List>
          <Divider
            orientation="horizontal"
            flexItem
            sx={{ display: lg ? 'block' : 'none' }}
          />
          <List
            sx={styles.list}
            component="ol"
            aria-hidden={collapsed && !lg}
            aria-label={t('commons.sidebar.menudescription')}
          >
            {additionalItems.map((item, index) => (
              <SidebarMenuItem
                onClick={() => !lg && setCollapsed(true)}
                collapsed={collapsed}
                item={item}
                key={`${item.label}-${index}`}
              />
            ))}
          </List>
          <Box sx={styles.hamburgerBox}>
            <Divider
              orientation="horizontal"
              flexItem
              sx={{ display: lg ? 'block' : 'none' }}
            />
            <Box sx={styles.hamburgerIcon}>
              <Tooltip
                placement="right"
                title={t(
                  !collapsed
                    ? 'commons.sidebar.collapse'
                    : 'commons.sidebar.expand'
                )}
              >
                <IconButton
                  data-testid="hamburgerButton"
                  aria-label={t(
                    !collapsed
                      ? 'commons.sidebar.collapse'
                      : 'commons.sidebar.expand'
                  )}
                  onClick={changeMenuState}
                  size="large"
                >
                  <MenuIcon />
                  {!lg && (
                    <Typography
                      variant="button"
                      sx={styles.hamburgerTypography}
                    >
                      {t('commons.sidebar.menu')}
                    </Typography>
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
        {overlay && <Box sx={styles.overlay} />}
      </Grid>
    </>
  );
};
