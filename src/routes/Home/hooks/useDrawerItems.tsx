import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath } from 'react-router';
import { DashboardResult, DrawerItem, DrawerItemConfig } from '../models';
import { DRAWER_ITEMS_CONFIG } from '../itemsMap';
import { useAppNavigate } from '../../../hooks/useAppNavigation';
import { PageRoutes } from '../..';

export const useDrawerItems = (
  searchResults?: DashboardResult,
  searchValue?: string
) => {
  const navigate = useAppNavigate();
  const { t } = useTranslation();

  const drawerItems = useMemo(() => {
    if (!searchResults) return [];

    return DRAWER_ITEMS_CONFIG.reduce<Array<DrawerItem>>((items, config) => {
      // Skip if the feature flag is not enabled
      if (!searchResults[config.hasKey]) {
        return items;
      }

      const idValue = searchResults[config.idKey];
      if (typeof idValue === 'boolean') {
        return items;
      }

      const itemConfig = idValue ? config.detail : config.list;

      const handleNavigation = () => {
        if (idValue) {
          navigateToDetail(config, idValue);
        } else {
          navigateToList(config, searchValue);
        }
      };

      items.push({
        icon: config.icon,
        label: t(itemConfig.labelKey),
        actionIcon: config.actionIcon,
        onAction: handleNavigation
      });

      return items;
    }, []);
  }, [searchResults, searchValue, navigate, t]);

  const navigateToDetail = (
    config: DrawerItemConfig,
    idValue: string | number
  ) => {
    const params = config.idParamName
      ? { [config.idParamName]: idValue }
      : undefined;
    const route = PageRoutes[config.detail.route];
    const path = generatePath(route, params);
    navigate(path);
  };

  const navigateToList = (config: DrawerItemConfig, searchValue?: string) => {
    const { filterKey, locationState, route } = config.list;
    const hashObject =
      filterKey && searchValue ? { [filterKey]: searchValue } : undefined;
    console.debug(PageRoutes[route], { state: locationState }, hashObject);
    const path = generatePath(PageRoutes[route], { state: locationState });
    navigate(path, { hashObject });
  };

  return drawerItems;
};
