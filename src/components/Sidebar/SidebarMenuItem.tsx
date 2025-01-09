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
  selectedTarget: string;
  setSelectedTarget: React.Dispatch<React.SetStateAction<string>>;
};

function renderIcon(Icon: React.ElementType) {
  return <Icon />;
}

export const SidebarMenuItem = ({ collapsed, item, onClick, selectedTarget, setSelectedTarget }: Props) => {
  const theme = useTheme();
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

  const handleListItemClick = (target: string, route?: string) => {
    setSelectedTarget(target);
  
    if (route) {
      navigate(route);
      if (!lg) {
        changeMenuState();
      }
    }
  };

  return (
    <Box sx={{ flexDirection: 'column', alignItems: 'stretch', width: '100%' }}>
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
        {(item.items && !collapsed) &&
         (open ? <ExpandLessRoundedIcon color="action" /> : <ExpandMoreRoundedIcon color="action" />)}
      </ListItemButton>

      {item.items && (
        <Collapse in={open && !collapsed} timeout="auto" unmountOnExit>
          <Box sx={{ pl: 1 }}>
            <List component="div" disablePadding>
              {item.items.map((subitem, subindex) => (
                <ListItemButton sx={{ pl: 8 }} 
                  selected={selectedTarget === `subitem-${subindex}`} 
                  onClick={() => handleListItemClick(`subitem-${subindex}`, subitem.route)}
                  key={subindex}>
                  <ListItemText primary={subitem.label} key={subindex} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Collapse>
      )}
    </Box>
  );
};
