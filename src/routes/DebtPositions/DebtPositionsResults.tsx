import { Grid, Stack, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Add from '@mui/icons-material/Add';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { DataGrid } from './components/DebtPositionsDataGrid';
import FilterContainer, { COMPONENT_TYPE } from '../../components/FilterContainer/FilterContainer';

export const DebtPositionsResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Stack gap={3}>
      <TitleComponent
        title={t('DebtPositions.Results.title')}
        callToAction={[
          {
            icon: <Add />,
            buttonText: t('commons.createNew'),
            onActionClick: () => console.log('create button clicked')
          }
        ]}
      />
      <Stack direction="row" gap={2} alignItems={'center'} justifyContent={'space-between'} my={1}>
        <FilterContainer
          items={[
            {
              type: COMPONENT_TYPE.textField,
              label: t('commons.searchCF'),
              gridWidth: 3
            },
            {
              type: COMPONENT_TYPE.dateRange,
              label: 'daterange',
              gridWidth: 4,
              from: { label: t('DebtPositions.Results.filters.from') },
              to: { label: t('dates.to') }
            },
            {
              type: COMPONENT_TYPE.select,
              label: t('commons.duetype'),
              gridWidth: 3,
              options: [
                { label: 'TARI', value: 'TARI' },
                { label: 'DOVUTO', value: 'DOVUTO' }
              ]
            },
            {
              type: COMPONENT_TYPE.select,
              label: t('commons.state'),
              gridWidth: 3,
              options: [{ label: 'TUTTI', value: 'TUTTI' }]
            },
            {
              type: COMPONENT_TYPE.button,
              label: t('commons.filters.filterResults'),
              gridWidth: 1,
              onClick: () => console.log('Filter applied')
            }
          ]}
        />
      </Stack>
      <Grid
        container
        p={2}
        height="100%"
        sx={{
          bgcolor: theme.palette.grey[200],
          overflow: 'auto'
        }}
        aria-label="results-table">
        <DataGrid />
      </Grid>
    </Stack>
  );
};
