import React from 'react';
import {
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  type Theme,
  useTheme,
} from '@mui/material';
import { NavLink } from 'react-router-dom';
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

export const SidebarMenuItem = ({ collapsed, item, onClick }: Props) => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const lg = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const { changeMenuState } = useCollapseMenu(!lg);

  const handleCollapseClick = () => {
    if (collapsed) changeMenuState();
    setOpen(!open);
  };

  return (
    <ListItem disablePadding sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <ListItemButton
        component={item.route && !item.items ? NavLink : 'div'}
        to={item.route ?? ''}
        onClick={item.items ? handleCollapseClick : onClick}
        sx={{
          px: 3,
          '&.hover': {
            backgroundColor: 'none',
          },
          '&.active': {
            fontWeight: item.route && !item.items ? 'bold' : 'normal',
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            borderRight: '2px solid',
            borderColor: theme.palette.primary.dark,
            '.MuiTypography-root': {
              fontWeight: 600,
              color: theme.palette.primary.dark,
            },
            '.MuiListItemIcon-root': {
              color: theme.palette.primary.dark,
            },
          },
        }}
      >
        {item.icon && <ListItemIcon aria-hidden="true">{renderIcon(item.icon)}</ListItemIcon>}
        {!collapsed && (
          <ListItemText
            id={`menu-item-${item.label.toLowerCase()}`}
            sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
            primary={item.label}
          />
        )}
        {item.items && (open ? <ExpandLessRoundedIcon color="action" /> : <ExpandMoreRoundedIcon color="action" />)}
      </ListItemButton>

      {item.items && (
        <Collapse in={open && !collapsed} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.items.map((subitem, subindex) => (
              <SidebarMenuItem
                key={subindex}
                item={subitem}
                collapsed={collapsed}
                onClick={onClick}
              />
            ))}
          </List>
        </Collapse>
      )}
    </ListItem>
  );
};
