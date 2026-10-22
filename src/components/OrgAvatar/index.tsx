import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

import Avatar, { type AvatarProps } from '@mui/material/Avatar';

type OrgAvatarProps = AvatarProps;

export const OrgAvatar = ({ ...avatarProps }: OrgAvatarProps) => (
  <Avatar
    data-testid="org-avatar"
    aria-hidden
    variant="rounded"
    {...avatarProps}
    sx={{
      width: 66,
      height: 66,
      backgroundColor: 'background.paper',
      ...avatarProps.sx
    }}
  >
    <AccountBalanceIcon />
  </Avatar>
);
