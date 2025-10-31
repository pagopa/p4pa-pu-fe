import { Box, MenuList, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { HomeDrawerListItem } from './HomeDrawerListItem';
import { useDrawerItems } from '../hooks/useDrawerItems';
import { DashboardResult } from '../models';

type HomeDrawerBodyProps = {
  searchLabel: string;
  searchValue: string;
  searchResults?: DashboardResult;
};

export const HomeDrawerBody = ({
  searchLabel,
  searchValue,
  searchResults
}: HomeDrawerBodyProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  // hook to get drawer items
  const drawerItems = useDrawerItems(searchResults, searchValue);

  return (
    <>
      <Box my={2}>
        <Typography component={'p'} variant={'body2'}>
          {t(`home.tabs.${searchLabel}.fieldLabel`)}
        </Typography>
        <Typography component={'p'} variant={'body1'} fontWeight={600}>
          {searchValue}
        </Typography>
      </Box>
      {drawerItems.length > 0 && (
        <Box my={2}>
          <Typography
            variant={'button'}
            textTransform={'uppercase'}
            color={theme.palette.grey[700]}
            id="home-drawer-actions"
          >
            {t('home.drawer.actions')}
          </Typography>
          <MenuList dense={false} aria-labelledby="home-drawer-actions">
            {drawerItems.map((item, index) => (
              <HomeDrawerListItem
                key={`drawer-item-${index}`}
                actionIcon={item.actionIcon}
                actionFunction={item.onAction}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </MenuList>
        </Box>
      )}
    </>
  );
};
