import React from 'react';
import { Collapse, List, ListItem, ListItemButton, ListItemIcon, ListItemText, useMediaQuery, type Theme, useTheme } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { SvgIconComponent } from '@mui/icons-material';
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

function renderIcon(Icon: SvgIconComponent | (() => JSX.Element)) {
  return <Icon></Icon>;
}

export const SidebarMenuItem = ({ collapsed, item, onClick }: Props) => {
  const theme = useTheme();
  const [selectedTarget, setSelectedTarget] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const lg = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const { changeMenuState } = useCollapseMenu(!lg);
  const handleCollapseClick = () => {
    if (collapsed) changeMenuState();
    setOpen(!open);
  };
  const handleListItemClick = (target: string) => {
    setSelectedTarget(target);
  };

  return (
    <ListItem disablePadding sx={{flexDirection: 'column', alignItems: 'stretch'}}>
      <ListItemButton
        end={item.end || false}
        component={NavLink}
        to={item.route}
        onClick={item.items ? handleCollapseClick : onClick}
        sx={{
          px: 3,
          '&.hover': {
            backgroundColor: 'none'
          },
          '&.active': {
            fontWeight: 'bold',
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
          }
        }}>
        {item.icon && <ListItemIcon aria-hidden="true">{renderIcon(item.icon)}</ListItemIcon>}
        {!collapsed && (
          <ListItemText
            id={`menu-item-${item.label.toLowerCase()}`}
            sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
            primary={item.label}
          />
        )}
        {(item.items && !collapsed ) && 
            (open ? <ExpandLessRoundedIcon color="action" /> : <ExpandMoreRoundedIcon color="action" />)}
      </ListItemButton>

      {item.items && 
        <Collapse in={open && !collapsed} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.items.map((subitem, subindex) => (
              <ListItemButton sx={{ pl: 8 }} 
                selected={selectedTarget === `subitem-${subindex}`} 
                onClick={() => handleListItemClick(`subitem-${subindex}`)}
                key={subindex}>
                <ListItemText primary={subitem.label} key={subindex} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      }
    </ListItem>
  );
};
