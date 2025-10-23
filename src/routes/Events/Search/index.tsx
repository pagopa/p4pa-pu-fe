import { useTranslation } from 'react-i18next';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import SearchCard from '../../../components/SearchCard/SearchCard';
import { tabs } from '../configs';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../..';
import { RegistryType } from '../configs';
import { useCallback, useState } from 'react';
import { ErrorMessage } from '../../../components/ErrorMessage/ErrorMessage';
import {
  noFilterSetted,
  shouldShowGeneralError
} from '../../../utils/filtersValidation';
import utils from '../../../utils';
import { FilterFieldValue } from '../../../models/Filters';

export const EventPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [filters, setFilters] = useState({});
  const [error, setError] = useState<boolean>(false);

  const handleFilterChange = (id: string, value: FilterFieldValue) => {
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  const handleTabChange = (newTabIndex: number) => {
    setActiveTabIndex(newTabIndex);
    resetFilters();
    setError(false);
  };

  const navigateToResults = useCallback(() => {
    if (noFilterSetted(filters)) {
      setError(shouldShowGeneralError(filters));
    } else {
      setError(false);
      const params = utils.URI.encode(filters);
      const registryType: RegistryType =
        activeTabIndex === 0 ? 'sil' : 'pagopa';
      const route = PageRoutes.BACKOFFICE_REGISTRY_LIST.replace(
        ':registryType',
        registryType
      );
      navigate(`${route}#${params}`);
    }
  }, [filters, navigate, activeTabIndex]);

  return (
    <>
      <TitleComponent title={t('commons.routes.BACKOFFICE_EVENTS')} />
      <SearchCard
        title={t('events.searchCardTitle')}
        description={t('events.searchCardDescription')}
        tabsConfig={tabs}
        filterValues={filters}
        activeTabIndex={activeTabIndex}
        onTabChange={handleTabChange}
        onFilterChange={handleFilterChange}
        render={error && <ErrorMessage />}
        onSubmit={navigateToResults}
        button={[
          {
            label: t('commons.filters.remove'),
            variant: 'outlined',
            onClick: resetFilters
          },
          {
            label: t('commons.filters.filterResults'),
            variant: 'contained'
          }
        ]}
      />
    </>
  );
};
