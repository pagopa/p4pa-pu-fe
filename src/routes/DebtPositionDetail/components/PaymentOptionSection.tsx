import { KeyboardArrowDown, ReadMore } from '@mui/icons-material';
import { Box, Accordion, AccordionSummary, Typography, Chip } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { t } from 'i18next';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import DetailContainer from '../../../components/DetailContainer/DetailContainer';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { moneyFormat } from '../../../utils/formatters';
import { PaymentOptionDisplayData } from '../DebtPositionDetail';

export const PaymentOptionSection = ({ optionData }: { optionData: PaymentOptionDisplayData }) => {
  const detailSection = {
    data: optionData.details,
    inline: true
  };

  const renderInstallmentColumns = (): GridColDef[] => [
    {
      field: 'iuv',
      headerName: 'Codice Avviso (IUV)',
      flex: 1,
      type: 'string',
    },
    {
      field: 'subject',
      headerName: 'Oggetto del pagamento',
      flex: 1,
      type: 'string',
    },
    {
      field: 'amount',
      headerName: 'Importo',
      flex: 0.5,
      type: 'number',
      renderCell: (params: GridRenderCellParams) =>
        moneyFormat(params.value as number)
    },
    {
      field: 'expirationDate',
      headerName: 'Data scadenza',
      flex: 1,
      type: 'string',
    },
    {
      field: 'status',
      headerName: 'Stato',
      flex: 0.5,
      type: 'string',
      renderCell: (params: GridRenderCellParams) => {
        const chipColor = params.row.status === t('commons.paid')
          ? 'success'
          : params.row.status === t('commons.unpaid')
            ? 'error'
            : 'info';

        return <Chip label={params.row.status} color={chipColor} />;
      }
    },
    {
      field: 'action',
      headerName: '',
      flex: 0.5,
      type: 'actions',
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) => (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          height: '100%',
          width: '100%'
        }}>
          <ReadMore
            fontSize="small"
            color='primary'
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              console.log('ReadMore Click iuv', params.row.iuv);
            }}
          />
        </div>
      ),
    }
  ];

  return (
    <Box mb={2}>
      <TitleComponent
        isSubtitle
        title={optionData.title}
        chip={optionData.chip}
      />

      <Accordion
        disableGutters
        sx={{
          py: 3,
          bgcolor: theme.palette.background.paper,
          borderRadius: 2
        }}
      >
        <AccordionSummary
          expandIcon={<KeyboardArrowDown color="primary" />}
          aria-controls="payment-detail"
        >
          <Typography variant='overline' ml={1}>
            {t('debtPositionDetail.solutionDetail')}
          </Typography>
        </AccordionSummary>
        <DetailContainer sections={[detailSection]} />
      </Accordion>

      <Box mt={2}>
        <CustomDataGrid
          rows={optionData.installments}
          columns={renderInstallmentColumns()}
          hideFooter={optionData.installments.length <= 5}
          disableColumnMenu
          disableColumnResize
        />
      </Box>
    </Box>
  );
};
