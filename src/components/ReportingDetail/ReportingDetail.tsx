import { useEffect } from 'react';
import { Grid, Typography, useTheme } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../TitleComponent/TitleComponent';
import DetailContainer, {
  DetailData
} from '../DetailContainer/DetailContainer';
import { useParams } from 'react-router-dom';
import FilterContainer, {
  COMPONENT_TYPE
} from '../FilterContainer/FilterContainer';
import { Search } from '@mui/icons-material';
import ReportingDetailDataGrid from './ReportingDetailDataGrid';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import { getPaymentsReportingRows } from '../../api/reporting';
import { moneyFormat } from '../../utils/formatters';
import { useReportingDetailFilters } from '../../hooks/useReportingDetailFilters';

export const ReportingDetail = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const iuf = id ?? '';

  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const {
    appliedFilters,
    draftFilters,
    updateDraftFilters,
    applyFilters,
    updatePagination,
    handleDateFromChange,
    handleDateToChange,
    hasActiveFilters,
    sortModel,
    handleSortModelChange
  } = useReportingDetailFilters();

  const { data, mutate } = getPaymentsReportingRows(organizationId, iuf);

  useEffect(() => {
    if (iuf && organizationId) {
      mutate(appliedFilters);
    }
  }, [iuf, organizationId, appliedFilters, mutate]);

  const firstReportItem = data?.content?.[0];

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const formatDateTime = (dateTimeString?: string) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return `${date.toLocaleDateString('it-IT')} ${date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  };

  const summaryData: Array<DetailData> = [
    {
      label: 'ID Rendicontazione / IUF',
      value: firstReportItem?.iuf || iuf
    },
    {
      label: 'ID Regolamento',
      value: firstReportItem?.regulationUniqueIdentifier || ''
    },
    {
      label: 'Data e ora',
      value: formatDateTime(firstReportItem?.flowDateTime)
    },
    {
      label: 'Data regolamento',
      value: formatDate(firstReportItem?.regulationDate)
    }
  ];

  const paymentData: Array<DetailData> = [
    {
      label: 'Totale pagamenti',
      value: firstReportItem?.totalPayments?.toString() || ''
    },
    {
      label: 'Importo totale',
      value: firstReportItem?.totalAmountCents
        ? moneyFormat(firstReportItem.totalAmountCents)
        : ''
    }
  ];

  return (
    <>
      <TitleComponent
        title={iuf}
        callToAction={[
          {
            icon: <DownloadIcon fontSize="small" />,
            buttonText: t('commons.files.downloadFlow'),
            onActionClick: () => console.log('Download')
          }
        ]}
      />
      <Grid container spacing={2}>
        <Grid item md={12}>
          <DetailContainer
            sections={[
              {
                title: { label: t('commons.summary'), variant: 'overline' },
                data: [...summaryData],
                inline: true
              },
              {
                title: { label: t('commons.payment'), variant: 'overline' },
                data: [...paymentData],
                inline: true
              }
            ]}
          />
        </Grid>
      </Grid>
      <Grid container marginTop={4}>
        <Typography variant="h6">{t('commons.detail')}</Typography>
        <Grid
          container
          direction="row"
          my={2}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <FilterContainer
            items={[
              {
                type: COMPONENT_TYPE.textField,
                label: t('commons.searchIUV'),
                icon: <Search />,
                gridWidth: 5,
                value: draftFilters.iuv || '',
                onChange: (e) => updateDraftFilters({ iuv: e.target.value })
              },
              {
                type: COMPONENT_TYPE.dateRange,
                label: 'dateRange',
                gridWidth: 6,
                from: {
                  label: t('dates.from'),
                  errorMessage: t('dates.validations.from'),
                  onChange: handleDateFromChange
                },
                to: {
                  label: t('dates.to'),
                  errorMessage: t('dates.validations.to'),
                  onChange: handleDateToChange
                }
              },
              {
                type: COMPONENT_TYPE.button,
                label: t('commons.filters.filterResults'),
                gridWidth: 1,
                onClick: applyFilters,
                disabled: !hasActiveFilters()
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
          <ReportingDetailDataGrid
            rows={data?.content || []}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            customPagination={{
              totalPages: data?.totalPages || 0,
              totalElements: data?.totalElements || 0,
              defaultPageOption: appliedFilters.size,
              sizePageOptions: [5, 10, 15, 20],
              onPageChange: (page) =>
                updatePagination({ page: page - 1, size: appliedFilters.size }),
              onPageSizeChange: (size) => updatePagination({ size, page: 0 }),
              currentPage: appliedFilters.page + 1
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ReportingDetail;
