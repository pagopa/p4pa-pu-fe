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
import { PageRoutes } from '../../routes/routes';
import { ISidebarMenuItem } from '../../models/SidebarMenuItem';
import useCollapseMenu from '../../hooks/useCollapseMenu';

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

  const menuItems: Array<ISidebarMenuItem> = [
    {
      label: t('menu.homepage'),
      icon: ViewSidebarIcon,
      route: PageRoutes.HOME,
      end: true
    },
    {
      label: t('menu.debtpositions'),
      icon: ReceiptLongIcon,
      route: '/debtpositions',
      end: true
    },
    {
      label: t('menu.flows'),
      icon: RotatedAltRouteIcon,
      // route: '/flows',
      end: false,
      items: [
        {
          label: t('menu.telematicreceipt'),
          route: PageRoutes.TELEMATIC_RECEIPT,
          end: true
        },
        {
          label: t('menu.subitem'),
          route: '/flows/item2',
          end: true
        }
      ]
    }
  ];

  const additionalItems = [
    {
      label: t('menu.entities'),
      icon: DnsIcon,
      route: '/debtpositions',
      end: true
    },
    {
      label: t('menu.users'),
      icon: PeopleIcon,
      route: '/debtpositions',
      end: true
    },
    {
      label: t('menu.deptstypes'),
      icon: DashboardIcon,
      route: '/debtpositions',
      end: true
    }
  ];

  return (
    <>
      <Box sx={styles.container} component="aside">
        <Grid
          alignItems="normal"
          display="flex"
          flexDirection="column"
          item
          component="nav"
          aria-expanded={!collapsed}
          aria-label={t('menu.navigationMenu')}
          role="navigation"
          sx={styles.nav}>
          {overlay && (
            <Box sx={styles.collapseIcon}>
              <Tooltip
                placement="left"
                title={t(!collapsed ? 'sidebar.collapse' : 'sidebar.expand')}>
                <IconButton
                  data-testid="collapseClose"
                  aria-label={t(!collapsed ? 'sidebar.collapse' : 'sidebar.expand')}
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
            aria-label={t('menu.description')}>
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
            aria-label={t('menu.description')}>
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
                title={t(!collapsed ? 'sidebar.collapse' : 'sidebar.expand')}>
                <IconButton
                  data-testid="hamburgerButton"
                  aria-label={t(!collapsed ? 'sidebar.collapse' : 'sidebar.expand')}
                  onClick={() => changeMenuState()}
                  size="large">
                  <MenuIcon />
                  {!lg && (
                    <Typography variant="button" sx={styles.hamburgerTypography}>
                      {t('menu.menu')}
                    </Typography>
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Grid>
      </Box>
      {overlay && <Box sx={styles.overlay} />}
    </>
  );
};
