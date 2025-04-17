import React, { useEffect, useState } from 'react';
import {
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  type Theme,
  useTheme,
  Box,
  SxProps
} from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material';
import { ISidebarMenuItem } from '../../models/SidebarMenuItem';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import useCollapseMenu from '../../hooks/useCollapseMenu';

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
};

const ListItem = (props: listItemProps) => {
  const { component, to = '', onClick, item, children, sx } = props;
  const theme = useTheme();
  return (
    <ListItemButton
      component={component}
      to={to}
      onClick={onClick}
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

  return (
    <Box sx={{ flexDirection: 'column', alignItems: 'stretch', width: '100%' }}>
      <ListItem
        item={item}
        to={item.route}
        component={item.route && !item.items ? NavLink : 'div'}
        onClick={item.items ? handleCollapseClick : onClick}
      >
        {item.icon && (
          <ListItemIcon aria-hidden="true">
            {renderIcon(item.icon)}
          </ListItemIcon>
        )}
        {!collapsed && (
          <ListItemText
            id={`menu-item-${item.label.toLowerCase()}`}
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
        <Collapse in={open && !collapsed} timeout="auto" unmountOnExit>
          <Box sx={{ pl: 1 }}>
            <List component="div" disablePadding>
              {item.items.map((subitem) => (
                <ListItem
                  key={subitem.route}
                  component={NavLink}
                  to={subitem.route}
                  item={subitem}
                  sx={{ pl: 8 }}
                  onClick={() => handleListItemClick(subitem.route)}
                >
                  <ListItemText primary={subitem.label} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Collapse>
      )}
    </Box>
  );
};
