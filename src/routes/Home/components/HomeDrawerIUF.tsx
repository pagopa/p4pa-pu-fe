import { useTranslation } from 'react-i18next';
import { HomeDrawerListItem } from './HomeDrawerListItem';
import { useAppNavigate } from '../../../hooks/useAppNavigation';
import { generatePath } from 'react-router';
import { DashboardByIuf } from '../../../../generated/core/data-contracts';
import { DrawerItemConfig } from '../models';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import DescriptionIcon from '@mui/icons-material/Description';
import { PageRoutes } from '../..';

type HomeDrawerIUFProps = {
  searchValue: string;
  searchResults: DashboardByIuf;
};

export const HomeDrawerIUF = ({
  searchValue,
  searchResults
}: HomeDrawerIUFProps) => {
  const { t } = useTranslation();
  const navigate = useAppNavigate();

  const navigateToIuf = () => {
    const { iuf } = searchResults;
    if (iuf) {
      const path = generatePath(PageRoutes.REPORTING_DETAIL, {
        id: iuf
      });
      navigate(path);
    } else {
      navigate(PageRoutes.REPORTING_SEARCH_RESULTS, {
        hashObject: { iuf: searchValue }
      });
    }
  };

  const navigateToClassification = () => {
    const { classificationId } = searchResults;
    if (classificationId) {
      const path = generatePath(PageRoutes.CLASSIFICATION_DETAIL, {
        classificationId
      });
      navigate(generatePath(path));
    } else {
      const path = PageRoutes.CLASSIFICATIONS_SEARCH_RESULTS;
      navigate(path, { hashObject: { iuf: searchValue } });
    }
  };

  const navigateToTreasury = () => {
    const { treasuryId } = searchResults;
    if (treasuryId) {
      const path = generatePath(PageRoutes.TREASURY_DETAIL, {
        id: treasuryId
      });
      navigate(generatePath(path));
    } else {
      const path = PageRoutes.TREASURIES_SEARCH_RESULTS;
      navigate(path, { hashObject: { iuf: searchValue } });
    }
  };

  const RotatedAltRouteIcon = () => {
    return (
      <AltRouteIcon
        sx={{ transform: 'rotate(90deg)' }}
        fontSize="small"
        color="primary"
      />
    );
  };

  const drawerItemsConfig: Array<DrawerItemConfig> = [
    {
      key: 'iuf',
      icon: <RotatedAltRouteIcon />,
      actionIcon: 'visit',
      labelKey: searchResults.iuf ? 'home.drawer.iuf' : 'home.drawer.iufs',
      shouldShow: searchResults.hasIuf,
      onAction: navigateToIuf
    },
    {
      key: 'classification',
      icon: <PlaylistAddCheckIcon fontSize="small" color="primary" />,
      actionIcon: 'visit',
      labelKey: searchResults.classificationId
        ? 'home.drawer.classification'
        : 'home.drawer.classifications',
      shouldShow: searchResults.hasClassification,
      onAction: navigateToClassification
    },
    {
      key: 'treasury',
      icon: <DescriptionIcon fontSize="small" color="primary" />,
      actionIcon: 'visit',
      labelKey: searchResults.treasuryId
        ? 'home.drawer.treasury'
        : 'home.drawer.treasuries',
      shouldShow: searchResults.hasTreasury,
      onAction: navigateToTreasury
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
