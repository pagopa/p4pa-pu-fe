import { Box, MenuList, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TABS, DashboardResult } from '../models';
import { HomeDrawerIUV } from './HomeDrawerIUV';
import { HomeDrawerFC } from './HomeDrawerFC';
import { HomeDrawerIUF } from './HomeDrawerIUF';

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

  const noResults =
    !searchResults || Object.values(searchResults).every((v) => !v);

  const DrawerItems = ({
    searchResults
  }: {
    searchResults: DashboardResult;
  }) => {
    switch (searchLabel) {
      case TABS.IUV:
        return (
          <HomeDrawerIUV
            searchValue={searchValue}
            searchResults={searchResults}
          />
        );
      case TABS.IUF:
        return (
          <HomeDrawerIUF
            searchValue={searchValue}
            searchResults={searchResults}
          />
        );
      case TABS.FC:
        return (
          <HomeDrawerFC
            searchValue={searchValue}
            searchResults={searchResults}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Box my={2}>
        <Typography component="p" variant="body2">
          {t(`home.tabs.${searchLabel}.fieldLabel`)}
        </Typography>
        <Typography component="p" variant="body1" fontWeight={600}>
          {searchValue}
        </Typography>
      </Box>
      <Box my={2}>
        <Typography
          variant="button"
          textTransform="uppercase"
          color={theme.palette.grey[700]}
          id="home-drawer-actions"
        >
          {t('home.drawer.actions')}
        </Typography>
        <MenuList dense={false} aria-labelledby="home-drawer-actions">
          {noResults ? (
            <Typography variant="body2">
              {searchLabel === TABS.FC
                ? t('home.noResults.descriptionFc')
                : t('home.noResults.description')}
            </Typography>
          ) : (
            <DrawerItems searchResults={searchResults} />
          )}
        </MenuList>
      </Box>
    </>
  );
};
