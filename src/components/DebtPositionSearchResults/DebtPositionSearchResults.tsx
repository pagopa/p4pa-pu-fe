import { Grid, Stack, useTheme } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import FilterContainer, { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';
import DebtPositionDataGrid from './DebtPositionDataGrid';

export const DebtPositionSearchResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Stack gap={5}>
      <TitleComponent
        title={t('DebtPositions.Results.titleIUV')}
        callToAction={[
          {
            icon: <Add />,
            buttonText: t('commons.createNew'),
            onActionClick: () => console.log('create button clicked')
          }
        ]}
      />
      <Stack gap={3}>
        <FilterContainer
          items={[
            {
              type: COMPONENT_TYPE.textField,
              label: t('commons.searchIUV'),
              gridWidth: 2
            },
            {
              type: COMPONENT_TYPE.textField,
              label: t('commons.searchCF'),
              gridWidth: 2
            },
            {
              type: COMPONENT_TYPE.dateRange,
              label: 'daterange',
              gridWidth: 3,
              from: { label: t('DebtPositions.Results.filters.from') },
              to: { label: t('dates.to') }
            },
            {
              type: COMPONENT_TYPE.select,
              label: t('commons.duetype'),
              gridWidth: 2,
              options: [
                { label: 'TARI', value: 'TARI' },
                { label: 'DOVUTO', value: 'DOVUTO' }
              ]
            },
            {
              type: COMPONENT_TYPE.select,
              label: t('commons.state'),
              gridWidth: 2,
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
        <Grid
          container
          p={2}
          height="100%"
          sx={{
            bgcolor: theme.palette.grey[200],
            overflow: 'auto'
          }}
          aria-label="results-table">
          <DebtPositionDataGrid/>
        </Grid>
      </Stack>
    </Stack>
  );
};
