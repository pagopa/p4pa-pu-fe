import { useEffect, useState, useMemo } from 'react';
import { Grid, Typography, useTheme } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import DetailContainer from '../../components/DetailContainer/DetailContainer';
import { useParams } from 'react-router-dom';
import FilterContainer, {
  COMPONENT_TYPE
} from '../../components/FilterContainer/FilterContainer';
import { Search } from '@mui/icons-material';
import ReportingDetailDataGrid from './components/ReportingDetailDataGrid';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import { getPaymentsReportingRows } from '../../api/reporting';
import {
  formatDate,
  formatDateTime,
  moneyFormat
} from '../../utils/formatters';
import { useReportingDetailFilters } from '../../hooks/useReportingDetailFilters';
import { PaymentsReporting } from '../../../generated/apiClient';
import { Variant } from '@mui/material/styles/createTypography';

export const ReportingDetail = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const iuf = id ?? '';

  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const [detailItem, setDetailItem] = useState<PaymentsReporting | null>(null);

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

  const cleanedFilters = useMemo(() => {
    const cleaned = { ...appliedFilters };
    if (cleaned.iuv === '') {
      cleaned.iuv = undefined;
    }
    return cleaned;
  }, [appliedFilters]);

  const { data, isLoading } = getPaymentsReportingRows(
    organizationId,
    iuf,
    cleanedFilters,
    { enabled: !!organizationId && !!iuf }
  );

  useEffect(() => {
    if (data?.content?.[0] && !detailItem) {
      setDetailItem(data.content[0]);
    }
  }, [data, detailItem]);

  const detailSections = useMemo(() => {
    const firstReportItem = detailItem;

    const summaryData = [
      {
        label: t('reportingDetail.reportingIdOrIUF'),
        value: firstReportItem?.iuf || iuf
      },
      {
        label: t('reportingDetail.regulationId'),
        value: firstReportItem?.regulationUniqueIdentifier || ''
      },
      {
        label: t('reportingDetail.hourAndDate'),
        value: formatDateTime(firstReportItem?.flowDateTime)
      },
      {
        label: t('reportingDetail.regulationDate'),
        value: formatDate(firstReportItem?.regulationDate)
      }
    ];

    const paymentData = [
      {
        label: t('reportingDetail.totalPayments'),
        value: firstReportItem?.totalPayments?.toString() || ''
      },
      {
        label: t('reportingDetail.totalAmount'),
        value: firstReportItem?.totalAmountCents
          ? moneyFormat(firstReportItem.totalAmountCents)
          : ''
      }
    ];

    return [
      {
        title: { label: t('commons.summary'), variant: 'overline' as Variant },
        data: [...summaryData],
        inline: true
      },
      {
        title: { label: t('commons.payments'), variant: 'overline' as Variant },
        data: [...paymentData],
        inline: true
      }
    ];
  }, [detailItem, iuf, t]);

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
          <DetailContainer sections={detailSections} />
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
                adornment: <Search />,
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
            isLoading={isLoading}
            customPagination={{
              totalPages: data?.totalPages || 0,
              totalElements: data?.totalElements || 0,
              defaultPageOption: appliedFilters.size,
              sizePageOptions: [5, 10, 15, 20],
              onPageChange: (page) =>
                updatePagination({
                  page: page - 1,
                  size: appliedFilters.size
                }),
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
