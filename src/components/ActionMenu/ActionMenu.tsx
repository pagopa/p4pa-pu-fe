import React from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import MoreVert from '@mui/icons-material/MoreVert';
import { FileDownload, ReadMore } from '@mui/icons-material';

interface ActionMenuProps {
  rowId: number;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ rowId }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        color="primary"
        size="small"
        onClick={handleClick}
        aria-controls={open ? `menu-${rowId}` : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <MoreVert />
      </IconButton>
      <Menu
        id={`menu-${rowId}`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': `menu-button-${rowId}`,
        }}
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <ReadMore fontSize="inherit" />
          </ListItemIcon>
          <ListItemText>Dettagio</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <FileDownload fontSize="inherit" />
          </ListItemIcon>
          <ListItemText>Scarica</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ActionMenu;
