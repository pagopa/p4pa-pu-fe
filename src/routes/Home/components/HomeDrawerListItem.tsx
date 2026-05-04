import { ListItemIcon, ListItemText, MenuItem, useTheme } from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import DownloadIcon from '@mui/icons-material/Download';

type HomeDrawerListItemProps = {
  actionIcon?: 'visit' | 'download';
  actionFunction: () => void;
  icon: React.ReactNode;
  label: string;
};

export const HomeDrawerListItem = ({
  actionIcon = 'visit',
  actionFunction,
  icon,
  label
}: HomeDrawerListItemProps) => {
  const theme = useTheme();

  return (
    <>
      <MenuItem
        divider
        sx={{
          py: 1,
          px: 0,
          '&:hover': { backgroundColor: theme.palette.background.paper }
        }}
        onClick={actionFunction}
        data-testid="home-drawer-list-item"
      >
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText>{label}</ListItemText>
        {actionIcon === 'visit' ? (
          <KeyboardArrowRightIcon color={'primary'} />
        ) : (
          <DownloadIcon color={'primary'} />
        )}
      </MenuItem>
    </>
  );
};
