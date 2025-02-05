import { Box, Grid, useTheme } from '@mui/material';
import { CalendarToday, Search } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import SearchResultsDataGrid from './ReportingDataGrid';
import TitleComponent from '../TitleComponent/TitleComponent';
import FilterContainer, { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';

const ReportingSearchResults = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  

  return (
    <>
      <Box >
        <Box>
          <TitleComponent 
            title={t('commons.routes.REPORTING_SEARCH_RESULTS')}
            description={t('reportingSearchResults.description')} 
          />
          <Grid>
            <Grid container direction="row" spacing={2}
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 2,
                flexWrap: 'nowrap'
              }}>
              <FilterContainer
                items={[
                  { type: COMPONENT_TYPE.textField, label: t('reportingSearchResults.searchReportingId'), icon: <Search />, gridWidth: 3 },
                  { type: COMPONENT_TYPE.textField, label: t('reportingSearchResults.searchRegulationId'), icon: <Search />, gridWidth: 3 },
                  { type: COMPONENT_TYPE.textField, label: t('reporting.regulationFrom'), icon: <CalendarToday />, gridWidth: 2 },
                  { type: COMPONENT_TYPE.textField, label: t('commons.to'), icon: <CalendarToday />, gridWidth: 2 },
                  { type: COMPONENT_TYPE.button, label: t('commons.filters.filterResults'), gridWidth: 1, onClick: () => console.log('Filter applied') },
                ]}
              />
            </Grid>
            <Grid 
              container
              p={2}
              height="100%"
              sx={{
                bgcolor: theme.palette.grey[200],
                overflow: 'auto'
              }}
              aria-label='results-table'
            >
              <SearchResultsDataGrid />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default ReportingSearchResults;
