import React, { useEffect, useState } from 'react';
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
import AltRouteIcon from '@mui/icons-material/AltRoute';
import DnsIcon from '@mui/icons-material/Dns';
import PeopleIcon from '@mui/icons-material/People';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { sidebarStyles } from './sidebar.styles';
import { PageRoutes } from '../../App';
import { ISidebarMenuItem } from '../../models/SidebarMenuItem';
import useCollapseMenu from '../../hooks/useCollapseMenu';
import { useStore } from '../../store/GlobalStore';
import { useFeConfig } from '../../hooks/useFeConfig';
import { setSuperAdmin } from '../../store/SuperAdminStore';
import { useOrganizations } from '../../hooks/useOrganizations';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const lg = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

  const { collapsed, changeMenuState, setCollapsed, setOverlay, overlay } = useCollapseMenu(!lg);

  const [selectedTarget, setSelectedTarget] = useState('');

  useEffect(() => {
    setOverlay(!(lg || collapsed));
  }, [lg, collapsed]);
  //This useEffect is needed, otherwise React will complain about the component being re rendered while another re render is in the queue.

  const styles = sidebarStyles(theme, collapsed);

  const RotatedAltRouteIcon = () => {
    return <AltRouteIcon sx={{ transform: 'rotate(90deg)' }} />;
  };
  const { state } = useStore();
  const configFe = useFeConfig();
  const organizations = useOrganizations();
  const containsBrokerCF = organizations?.some(item => item.orgFiscalCode === configFe?.brokerFiscalCode);

  if (containsBrokerCF) {
    setSuperAdmin(true);
  }

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
      route: '/debtpositions',
      end: true
    },
    {
      label: t('commons.routes.FLOWS'),
      icon: RotatedAltRouteIcon,
      // route: '/flows',
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
        },
      ]
    }
  ];

  const additionalItems = [];

  if (state.superAdmin) {
    additionalItems.push(
      {
        label: t('commons.routes.ORGANIZATIONS'),
        icon: DnsIcon,
        route: '/debtpositions',
        end: true
      }
    );
  }

  if (state.superAdmin || state.operatorRole == 'ROLE_ADMIN') {
    const debtypes = [];

    // Debtypes catalog only for superAdmin
    if (state.superAdmin) {
      debtypes.push(
        {
          label: t('commons.routes.DEBT_TYPES_CATALOG'),
          route: PageRoutes.DEBT_TYPES_CATALOG,
          end: true
        }
      );
    }
    
    debtypes.push(
      {
        label: t('commons.routes.DEBT_TYPES_CREATED'),
        route: PageRoutes.DEBT_TYPES_CATALOG,
        end: true
      }
    );

    additionalItems.push(
      {
        label: t('commons.routes.USERS'),
        icon: PeopleIcon,
        route: '/debtpositions',
        end: true
      },
      {
        label: t('commons.routes.DEBT_TYPES'),
        icon: DashboardIcon,
        end: false,
        items: debtypes
      }
    );
  }

  return (
    <>
      <Grid
        component={'aside'}
        item
        sx={styles.container}
        lg={collapsed ? 'auto' : 2}>
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
                title={t(!collapsed ? 'commons.sidebar.collapse' : 'commons.sidebar.expand')}>
                <IconButton
                  data-testid="collapseClose"
                  aria-label={t(!collapsed ? 'commons.sidebar.collapse' : 'commons.sidebar.expand')}
                  onClick={() => changeMenuState()}
                  size="large">
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          <List
            sx={styles.list}
            component="ol"
            aria-hidden={collapsed && !lg}
            aria-label={t('commons.sidebar.menudescription')}>
            {menuItems.map((item, index) => (
              <SidebarMenuItem
                onClick={() => !lg && setCollapsed(true) && setSelectedTarget('')}
                selectedTarget={selectedTarget}
                setSelectedTarget={setSelectedTarget}
                collapsed={collapsed}
                item={item}
                key={index}
              />
            ))}
          </List>
          <Divider orientation="horizontal" flexItem sx={{ display: lg ? 'block' : 'none' }} />
          <List
            sx={styles.list}
            component="ol"
            aria-hidden={collapsed && !lg}
            aria-label={t('commons.sidebar.menudescription')}>
            {additionalItems.map((item, index) => (
              <SidebarMenuItem
                onClick={() => !lg && setCollapsed(true) && setSelectedTarget('')}
                selectedTarget={selectedTarget}
                setSelectedTarget={setSelectedTarget}
                collapsed={collapsed}
                item={item}
                key={index}
              />
            ))}
          </List>
          <Box sx={styles.hamburgerBox}>
            <Divider orientation="horizontal" flexItem sx={{ display: lg ? 'block' : 'none' }} />
            <Box sx={styles.hamburgerIcon}>
              <Tooltip
                placement="right"
                title={t(!collapsed ? 'commons.sidebar.collapse' : 'commons.sidebar.expand')}>
                <IconButton
                  data-testid="hamburgerButton"
                  aria-label={t(!collapsed ? 'commons.sidebar.collapse' : 'commons.sidebar.expand')}
                  onClick={() => changeMenuState()}
                  size="large">
                  <MenuIcon />
                  {!lg && (
                    <Typography variant="button" sx={styles.hamburgerTypography}>
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
