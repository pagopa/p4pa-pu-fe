import React from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import MoreVert from '@mui/icons-material/MoreVert';
import { FileDownload, ReadMore } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ActionMenuProps {
  rowId: number;
  onDetailClick: (rowId: number) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ rowId, onDetailClick }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { t } = useTranslation();

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
        <MenuItem
          onClick={() => {
            handleClose();
            onDetailClick(rowId);
          }}
        >
          <ListItemIcon>
            <ReadMore fontSize="inherit" />
          </ListItemIcon>
          <ListItemText aria-label={t('actionMenu.detail')}>{t('actionMenu.detail')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <FileDownload fontSize="inherit" />
          </ListItemIcon>
          <ListItemText aria-label={t('actionMenu.download')}>{t('actionMenu.download')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ActionMenu;
