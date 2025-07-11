import { useTranslation } from 'react-i18next';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import SearchCard, {
  ErrorMessage
} from '../../../components/SearchCard/SearchCard';
import { tabs, testFilterValidity } from '../configs';
import { useOutletContext } from 'react-router';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../..';
import { RegistryType } from '../configs';
import { EventsContext } from '../EventsContainer';
import { useEffect } from 'react';

const EventPage = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const {
    filterValues,
    activeTabIndex,
    setError,
    error,
    handleTabChange,
    handleResetFilter,
    handleFilterChange
  } = useOutletContext<EventsContext>();

  const handleSubmit = async () => {
    setError(false);

    if (!testFilterValidity(filterValues[activeTabIndex])) {
      setError(true);
      return;
    }

    const registryType: RegistryType = activeTabIndex === 0 ? 'sil' : 'pagopa';
    navigate(
      PageRoutes.BACKOFFICE_REGISTRY_LIST.replace(':registryType', registryType)
    );
  };

  useEffect(() => {
    setError(false);
  }, []);

  return (
    <>
      <TitleComponent title={t('commons.routes.BACKOFFICE_EVENTS')} />
      <SearchCard
        title={t('events.searchCardTitle')}
        description={t('events.searchCardDescription')}
        tabsConfig={tabs}
        filterValues={filterValues[activeTabIndex]}
        activeTabIndex={activeTabIndex}
        onTabChange={handleTabChange}
        onFilterChange={handleFilterChange}
        render={error && ErrorMessage}
        button={[
          {
            label: t('commons.filters.remove'),
            variant: 'outlined',
            onClick: handleResetFilter
          },
          {
            label: t('commons.filters.filterResults'),
            variant: 'contained',
            onClick: handleSubmit
          }
        ]}
      />
    </>
  );
};

export default EventPage;
