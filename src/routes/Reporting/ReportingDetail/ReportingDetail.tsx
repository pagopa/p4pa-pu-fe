import { Search } from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Variant } from '@mui/material/styles/createTypography';
import { Grid, Typography, useTheme } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import { hasPartialDateRangeErrors } from '../../../utils/filtersValidation';

import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import DetailContainer from '../../../components/DetailContainer/DetailContainer';
import FilterContainer, {
  COMPONENT_TYPE
} from '../../../components/FilterContainer/FilterContainer';
import ReportingDetailDataGrid from './components/ReportingDetailDataGrid';
import { useStore } from '../../../store/GlobalStore';
import {
  formatDate,
  formatDateTime,
  moneyFormat
} from '../../../utils/formatters';
import { PaymentsReportingWithReceiptView } from '../../../../generated/apiClient';
import { PageRoutes } from '../../../routes';
import { getPaymentsReportingRows } from '../../../api/reporting';
import { useSearch } from '../../../hooks/useSearch';
import utils from '../../../utils';
import { FieldValues } from 'react-hook-form';
import { FilterFieldIds } from '../../../models/SearchCardFields';
import { getIngestionFlowFile } from '../../../api/ingestionFlowFiles';
import { downloadBlob } from '../../../utils/download';

export const ReportingDetail = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { id: iuf } = useParams();
  const {
    state: { organizationId }
  } = useStore();
  const location = useLocation();

  const initialFilters: FieldValues = utils.URI.decode(window.location.hash);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  if (!iuf) {
    navigate(PageRoutes.RESPONSES_ERROR);
    return null;
  }

  const [detailItem, setDetailItem] =
    useState<PaymentsReportingWithReceiptView | null>(null);
  const [currentIngestionFlowFileId, setCurrentIngestionFlowFileId] = useState<
    number | undefined
  >(location.state?.ingestionFlowFileId);

  const query = getPaymentsReportingRows(organizationId, iuf);

  const reportingRows = useSearch({
    query,
    filters: appliedFilters
  });

  useEffect(() => {
    if (reportingRows.query.isError && reportingRows.query.error) {
      console.error(
        'Error loading payments reporting rows:',
        reportingRows.query.error
      );
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  }, [reportingRows.query.isError, reportingRows.query.error, navigate]);

  useEffect(() => {
    if (reportingRows.query.data?.content?.[0] && !detailItem) {
      setDetailItem(reportingRows.query.data.content[0]);
    }
  }, [reportingRows.query.data, detailItem]);

  useEffect(() => {
    if (
      !currentIngestionFlowFileId &&
      reportingRows.query.data?.content?.[0]?.ingestionFlowFileId
    ) {
      setCurrentIngestionFlowFileId(
        reportingRows.query.data.content[0].ingestionFlowFileId
      );
    }
  }, [reportingRows.query.data, currentIngestionFlowFileId]);

  const mutation = getIngestionFlowFile(organizationId);

  const downloadIngestionFlowFile = async () => {
    if (!currentIngestionFlowFileId) {
      utils.notify.emit(t('commons.files.downloadFailed'));
      return;
    }
    try {
      const { fileName, data } = await mutation.mutateAsync(
        currentIngestionFlowFileId
      );
      downloadBlob(data, fileName);
    } catch (error) {
      console.error('Error downloading file:', error);
      utils.notify.emit(t('commons.files.downloadFailed'));
    }
  };

  /**
   * Validates filters before applying them to prevent API calls with partial date ranges.
   */
  const handleFiltersApplied = useCallback(() => {
    // Check if there are partial date range errors (only 'from' or only 'to' filled)
    if (hasPartialDateRangeErrors(appliedFilters)) {
      // Don't apply filters if there are partial date range errors
      // The DateRange component already shows visual error messages
      return;
    }

    // Apply filters if validation passes
    reportingRows.applyFilters(appliedFilters);
  }, [appliedFilters, reportingRows]);

  const detailSections = useMemo(() => {
    const firstReportItem = detailItem;

    const summaryData = [
      {
        label: t('reportingDetail.reportingIdOrIUF'),
        value: firstReportItem?.iuf || iuf || ''
      },
      {
        label: t('reportingDetail.regulationId'),
        value: firstReportItem?.regulationUniqueIdentifier || ''
      },
      {
        label: t('reportingDetail.hourAndDate'),
        value: formatDateTime(firstReportItem?.flowDateTime) || ''
      },
      {
        label: t('reportingDetail.regulationDate'),
        value: formatDate(firstReportItem?.regulationDate) || ''
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
        title={iuf || ''}
        accessibleTitle={t('reportingDetail.accessibleTitle', {
          iuf: iuf,
          interpolation: { escapeValue: false }
        })}
        callToAction={[
          {
            icon: <DownloadIcon fontSize="small" />,
            buttonText: t('commons.files.downloadFlow'),
            onActionClick: downloadIngestionFlowFile
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
                id: FilterFieldIds.IUV_CODE,
                label: t('commons.searchIUV'),
                adornment: <Search />,
                gridWidth: 5,
                value: appliedFilters.iuv || ''
              },
              {
                type: COMPONENT_TYPE.dateRange,
                label: 'dateRange',
                gridWidth: 6,
                from: {
                  label: t('dates.from'),
                  errorMessage: t('dates.validations.from')
                },
                to: {
                  label: t('dates.to'),
                  errorMessage: t('dates.validations.to')
                }
              },
              {
                type: COMPONENT_TYPE.button,
                label: t('commons.filters.filterResults'),
                gridWidth: 1
              }
            ]}
            values={appliedFilters}
            onChange={(field, value) =>
              setAppliedFilters({ ...appliedFilters, [field]: value })
            }
            onSubmit={handleFiltersApplied}
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
          data-testid="results-table"
        >
          <ReportingDetailDataGrid
            data={reportingRows.query.data}
            isLoading={reportingRows.query.isPending}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ReportingDetail;
