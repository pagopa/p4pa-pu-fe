import { useTranslation } from 'react-i18next';
import { HomeDrawerListItem } from './HomeDrawerListItem';
import { useAppNavigate } from '../../../hooks/useAppNavigation';
import { generatePath } from 'react-router';
import DescriptionIcon from '@mui/icons-material/Description';
import { DashboardByIuf } from '../../../../generated/data-contracts';
import { DrawerItemConfig } from '../models';

type HomeDrawerIUFProps = {
  searchValue: string;
  searchResults?: DashboardByIuf;
};

// TODO: Check if actions are correct
export const HomeDrawerIUF = ({ searchResults }: HomeDrawerIUFProps) => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();

  if (!searchResults) return null;

  const navigateToIuf = () => {
    const { iuf } = searchResults;
    if (iuf) {
      navigate(generatePath('/iuf', { iuf }));
    } else {
      navigate('/iufs');
    }
  };

  const drawerItemsConfig: Array<DrawerItemConfig> = [
    {
      key: 'iuf',
      icon: <DescriptionIcon fontSize="small" color="primary" />,
      actionIcon: 'visit',
      labelKey: searchResults.iuf ? 'home.drawer.iuf' : 'home.drawer.iufs',
      shouldShow: searchResults.hasIuf,
      onAction: navigateToIuf
    }
  ];

  const visibleDrawerItems = drawerItemsConfig
    .filter((config) => config.shouldShow)
    .map((config) => (
      <HomeDrawerListItem
        key={config.key}
        actionIcon={config.actionIcon}
        actionFunction={config.onAction}
        icon={config.icon}
        label={t(config.labelKey)}
      />
    ));

  return <>{visibleDrawerItems}</>;
};
