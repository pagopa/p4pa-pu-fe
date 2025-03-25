import { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid, Stack, useTheme } from '@mui/material';
import { Search } from '@mui/icons-material';
import FilterContainer, {
  COMPONENT_TYPE
} from '../FilterContainer/FilterContainer';
import TitleComponent from '../TitleComponent/TitleComponent';
import SearchResultsDataGrid from './ReportingDataGrid';
import { BaseFilterValues } from '../../models/Filters';
import { PagedPaymentsReportingView } from '../../../generated/data-contracts';
import useReportingSearch from '../../hooks/useReportingSearch';

export type LocationState = {
  filters: BaseFilterValues;
};

const ReportingSearchResults = () => {
  console.log('REPORTING SEARCH RESULTS');
  const theme = useTheme();
  const { t } = useTranslation();
  // const {
  //   state: { filters: initialFilters }
  // }: { state: LocationState } = useLocation();
  console.log('Location:', location);

  const [searchParams, setSearchParams] = useSearchParams();

  const pageFromUrl = parseInt(searchParams.get('page') || '1'); // default = 1
  const sizeFromUrl = parseInt(searchParams.get('size') || '10');

  const reportingSearch = useReportingSearch({
    // initialFilters
    initialFilters: {
      // regulationDateFrom: new Date('2024-01-01'),
      // regulationDateTo: new Date('2024-03-31')
      // regulationUniqueIdentifier: '1201240790068119'
    },
    initialPage: pageFromUrl - 1, // parte da 0
    initialSize: sizeFromUrl
  });
  console.log('reportingSearch', reportingSearch);

  useEffect(() => {
    const totalPages = reportingSearch.query.data?.totalPages;
    const currentDataPage = reportingSearch.pagination.page; // paginazione  inizia da 0
    const currentDataSize = reportingSearch.pagination.size;
    const currentUrlPage = parseInt(searchParams.get('page') || '1'); // paginazione url inizia da 1

    console.log('currentDataPage', currentDataPage);
    console.log('currentUrlPage', currentUrlPage);
    console.log('totalPages', totalPages);

    if (totalPages !== undefined && currentUrlPage > totalPages) {
      // Evitare loop: aggiornare solo se la URL è disallineata dallo stato
      if (currentDataPage !== 0) {
        reportingSearch.handlePageChange(0);
      }
      // Creo una copia dei parametri URL attuali
      const params = new URLSearchParams(searchParams);
      console.log('currentDataSize', currentDataSize);
      params.set('page', '1');
      params.set('size', String(currentDataSize));
      // Usare replace per evitare "indietro"
      setSearchParams(params, { replace: true });
    }
  }, [reportingSearch.query.data?.totalPages]);

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set('page', String(newPage));
      return params;
    });
    reportingSearch.handlePageChange(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set('size', String(newSize));
      return params;
    });
    reportingSearch.handlePageSizeChange(newSize);
  };

  return (
    <Stack>
      <TitleComponent
        title={t('commons.routes.REPORTING_SEARCH_RESULTS')}
        description={t('reportingSearchResults.description')}
      />

      <Stack gap={3}>
        {/* <FilterContainer
          items={filters}
          values={telematicReceipts.filterValues}
          onChange={telematicReceipts.handleFilterChange}
        /> */}
        <Grid
          container
          p={2}
          height="100%"
          sx={{
            bgcolor: theme.palette.grey[200],
            overflow: 'auto'
          }}
          aria-label="results-table"
        >
          <SearchResultsDataGrid
            data={reportingSearch.query.data as PagedPaymentsReportingView}
            // onPageChange={reportingSearch.handlePageChange}
            // onPageSizeChange={reportingSearch.handlePageSizeChange}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSortChange={reportingSearch.setSort}
            pagination={reportingSearch.pagination}
          />
        </Grid>
      </Stack>

      {/* <Grid>
        <Grid
          container
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 2,
            flexWrap: 'nowrap'
          }}
        >
          <FilterContainer
            items={[
              {
                type: COMPONENT_TYPE.textField,
                label: t('reportingSearchResults.searchReportingId'),
                icon: <Search />,
                gridWidth: 3
              },
              {
                type: COMPONENT_TYPE.textField,
                label: t('reportingSearchResults.searchRegulationId'),
                icon: <Search />,
                gridWidth: 3
              },
              {
                type: COMPONENT_TYPE.dateRange,
                label: 'reportingSearchResults.searchDateRange',
                from: { label: t('reporting.regulationFrom') },
                to: { label: t('dates.to') },
                gridWidth: 5
              },
              {
                type: COMPONENT_TYPE.button,
                label: t('commons.filters.filterResults'),
                gridWidth: 1,
                onClick: () => console.log('Filter applied')
              }
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
          aria-label="results-table"
        >
          <SearchResultsDataGrid />
        </Grid>
      </Grid> */}
    </Stack>
  );
};

export default ReportingSearchResults;
