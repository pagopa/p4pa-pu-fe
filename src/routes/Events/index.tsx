import { useTranslation } from 'react-i18next';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import SearchCard, { TabsConfig } from '../../components/SearchCard/SearchCard';
import {
  COMPONENT_TYPE,
  FilterItem
} from '../../components/FilterContainer/FilterContainer';
import { Search } from '@mui/icons-material';

const fields: Array<FilterItem> = [
  {
    type: COMPONENT_TYPE.textField,
    label: 'debtPositions.searchEntityDescription',
    adornment: <Search />,
    id: 'poiSiVede'
  },
  {
    type: COMPONENT_TYPE.textField,
    label: 'debtPositions.searchIUVDescription',
    adornment: <Search />,
    id: 'poiSiVede'
  },
  {
    type: COMPONENT_TYPE.dateRange,
    label: 'dateRange',
    required: true,
    from: { label: 'from' },
    to: { label: 'to' },
    id: 'poiSiVede'
  },
  {
    type: COMPONENT_TYPE.select,
    label: 'esito',
    options: [
      { label: 'OK', value: 'OK' },
      { label: 'KO', value: 'KO' }
    ],
    defaultValue: '',
    id: 'poiSiVede'
  },
  {
    type: COMPONENT_TYPE.select,
    label: 'evento',
    options: [
      { label: 'OK', value: 'OK' },
      { label: 'KO', value: 'KO' }
    ],
    defaultValue: '',
    id: 'poiSiVede'
  }
];

const tabs: Array<TabsConfig> = [
  {
    label: 'events.tabs.sil',
    fields
  },
  {
    label: 'events.tabs.nodo',
    fields
  }
];

const EventPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <TitleComponent title={t('commons.routes.EVENTS')} />
      <SearchCard
        title={t('events.searchCardTitle')}
        description={t('events.searchCardDescription')}
        tabsConfig={tabs}
        button={[
          {
            label: t('commons.filters.remove'),
            variant: 'outlined'
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

export default EventPage;
