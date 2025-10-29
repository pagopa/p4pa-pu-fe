import { Box, MenuList, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { HomeDrawerListItem } from './HomeDrawerListItem';

type HomeDrawerBodyProps = {
  searchLabel: string;
  searchValue: string;
};

export const HomeDrawerBody = ({
  searchLabel,
  searchValue
}: HomeDrawerBodyProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <Box my={2}>
        <Typography component={'p'} variant={'body2'}>
          {t(`home.tabs.${searchLabel}.label`)}
        </Typography>
        <Typography component={'p'} variant={'body1'} fontWeight={600}>
          {searchValue}
        </Typography>
      </Box>
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
          {/* TO-DO: put here the cycle of results */}
          <HomeDrawerListItem
            actionIcon="visit"
            actionFunction={() => console.log('visit')}
            icon={<ReceiptLongIcon fontSize="small" color={'primary'} />}
            label={'Visit the link'} // TODO: set a proper label
          />
          <HomeDrawerListItem
            actionIcon="download"
            actionFunction={() => console.log('download')}
            icon={<ReceiptLongIcon fontSize="small" color={'primary'} />}
            label={'Download the file'} // TODO: set a proper label
          />
        </MenuList>
      </Box>
    </>
  );
};
