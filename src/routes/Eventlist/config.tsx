import { ReadMore } from '@mui/icons-material';
import i18n from '../../translations/i18n';
import { GridColDef } from '@mui/x-data-grid';
import { nodoFields, silFields } from '../Events/configs';
import { COMPONENT_TYPE } from '../../components/FilterContainer/FilterContainer';

export const columns: Array<GridColDef> = [
  {
    field: 'eventDate',
    headerName: i18n.t('event.DataEvento'),
    flex: 1,
    type: 'date'
  },
  {
    field: 'org',
    headerName: i18n.t('event.Ente'),
    flex: 1,
    type: 'string'
  },
  {
    field: 'iuv',
    headerName: i18n.t('event.IUV'),
    flex: 1,
    type: 'string'
  },
  {
    field: 'event',
    headerName: i18n.t('event.EVENTO'),
    flex: 1,
    type: 'string'
  },
  {
    field: 'action',
    headerName: '',
    flex: 0.5,
    sortable: false,
    align: 'right',
    headerAlign: 'right',
    renderCell: () => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          height: '100%',
          width: '100%'
        }}
      >
        <ReadMore color="primary" onClick={console.log} />
      </div>
    )
  }
];

export const getFilters = (registryType: RegistryType) => {
  const fields = registryType === 'pagopa' ? nodoFields : silFields;
  const filters = [
    ...fields.map((el) => ({ ...el, gridWidth: 3 })),
    { type: COMPONENT_TYPE.button, label: 'cerca', gridWidth: 3 }
  ];

  return filters;
};

export type RegistryType = 'pagopa' | 'sil';
