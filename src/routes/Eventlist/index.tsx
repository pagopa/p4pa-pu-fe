import FilterContainer from '../../components/FilterContainer/FilterContainer';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import CustomDataGrid from '../../components/DataGrid/CustomDataGrid';

import { columns, getFilters, RegistryType } from './config';
import { useParams } from 'react-router';

const rows = [
  { id: 1, iuv: 1, event: 'test', eventDate: new Date(), org: 'qqwnfjkdns1' },
  { id: 2, iuv: 2, event: 'test', eventDate: new Date(), org: 'qqwnfjkdns1' }
];

const EventList = () => {
  const { registryType } = useParams<{
    registryType: RegistryType;
  }>();

  const filters = getFilters(registryType || 'pagopa');
  return (
    <>
      <TitleComponent title={'Risultato ricerca'} />
      <FilterContainer items={filters} values={{}} onChange={console.log} />
      <CustomDataGrid rows={rows} columns={columns} />
    </>
  );
};

export default EventList;
