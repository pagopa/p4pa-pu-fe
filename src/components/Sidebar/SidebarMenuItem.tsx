import type React from 'react';
import { useEffect, useState } from 'react';
import { type Theme } from '@mui/material';
import { NavLink, useNavigate } from 'react-router';
import type { ISidebarMenuItem } from '../../models/SidebarMenuItem';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import useCollapseMenu from '../../hooks/useCollapseMenu';

import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme, alpha, type SxProps } from '@mui/material/styles';
import Box from '@mui/material/Box';

type Props = {
  collapsed: boolean;
  item: ISidebarMenuItem;
  onClick: React.MouseEventHandler<HTMLAnchorElement> | undefined;
};

function renderIcon(Icon: React.ElementType) {
  return <Icon />;
}

type listItemProps = {
  component: React.ElementType;
  to?: string;
  onClick?: (() => void) | React.MouseEventHandler<HTMLAnchorElement>;
  item: ISidebarMenuItem;
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
  open?: boolean;
};

const ListItem = (props: listItemProps) => {
  const { component, to = '', onClick, item, children, sx, open } = props;
  const theme = useTheme();
  return (
    <ListItemButton
      component={component}
      to={to}
      onClick={onClick}
      role={component === 'button' ? 'button' : 'link'}
      aria-controls={
        component === 'button'
          ? `submenu-${item.label.toLowerCase().replace(/ /g, '-')}`
          : undefined
      }
      aria-expanded={component === 'button' ? open : undefined}
      sx={{
        px: 3,
        '&.hover': {
          backgroundColor: 'none'
        },
        '&.active': {
          fontWeight: item.route && !item.items ? 'bold' : 'normal',
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          borderRight: '2px solid',
          borderColor: theme.palette.primary.dark,
          '.MuiTypography-root': {
            fontWeight: 600,
            color: theme.palette.primary.dark
          },
          '.MuiListItemIcon-root': {
            color: theme.palette.primary.dark
          }
        },
        ...sx
      }}
    >
      {children}
    </ListItemButton>
  );
};

export const SidebarMenuItem = ({ collapsed, item, onClick }: Props) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const lg = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const { changeMenuState } = useCollapseMenu(!lg);

  useEffect(() => {
    if (collapsed) {
      setOpen(false);
    }
  }, [collapsed]);

  const handleCollapseClick = () => {
    if (collapsed) {
      changeMenuState();
    }
    setOpen(!open);
  };

  const handleListItemClick = (route?: string) => {
    if (route) {
      navigate(route);
      if (!lg) {
        changeMenuState();
      }
    }
  };

  //When the collapse animation finishes, focus the first item in the submenu for better accessibility.
  const handleCollapseEnd = (el: HTMLElement) => {
    const list = el.querySelector('ul');
    const firstItem = list?.querySelector('a');
    if (firstItem) {
      firstItem.focus();
    }
  };

  return (
    <Box
      sx={{ flexDirection: 'column', alignItems: 'stretch', width: '100%' }}
      component={'li'}
    >
      <ListItem
        item={item}
        to={item.route}
        component={item.route && !item.items ? NavLink : 'button'}
        onClick={item.items ? handleCollapseClick : onClick}
        sx={{ width: '100%' }}
        open={open}
      >
        {item.icon && (
          <ListItemIcon aria-hidden="true">
            {renderIcon(item.icon)}
          </ListItemIcon>
        )}
        {!collapsed && (
          <ListItemText
            data-testid={`item-${item.label.toLowerCase().replace(/ /g, '-')}`}
            sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
            primary={item.label}
          />
        )}
        {item.items &&
          !collapsed &&
          (open ? (
            <ExpandLessRoundedIcon color="action" />
          ) : (
            <ExpandMoreRoundedIcon color="action" />
          ))}
      </ListItem>

      {item.items && (
        <Collapse
          in={open && !collapsed}
          onEntered={handleCollapseEnd}
          timeout="auto"
          unmountOnExit
          sx={{ pl: 2 }}
        >
          <List
            id={`submenu-${item.label.toLowerCase().replace(/ /g, '-')}`}
            disablePadding
          >
            {item.items.map((subitem) => (
              <li key={subitem.route}>
                <ListItem
                  component={NavLink}
                  to={subitem.route}
                  item={subitem}
                  sx={{ pl: 8 }}
                  onClick={() => handleListItemClick(subitem.route)}
                >
                  <ListItemText primary={subitem.label} />
                </ListItem>
              </li>
            ))}
          </List>
        </Collapse>
      )}
    </Box>
  );
};
