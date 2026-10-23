import { theme } from '@pagopa/mui-italia';
import { t } from 'i18next';
import CustomDataGrid from '../../../components/DataGrid/CustomDataGrid';
import DetailContainer from '../../../components/DetailContainer/DetailContainer';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { moneyFormat } from '../../../utils/formatters';
import type { PaymentOptionDisplayData } from '../DebtPositionDetail';
import { generatePath, useNavigate } from 'react-router';
import { PageRoutes } from '../../../routes';

import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import ReadMore from '@mui/icons-material/ReadMore';

export const PaymentOptionSection = ({
  optionData
}: {
  optionData: PaymentOptionDisplayData;
}) => {
  const detailSection = {
    data: optionData.details,
    inline: true
  };

  const navigate = useNavigate();

  const renderInstallmentColumns = (): Array<GridColDef> => [
    {
      field: 'iuv',
      headerName: 'Codice Avviso (IUV)',
      flex: 1,
      type: 'string'
    },
    {
      field: 'subject',
      headerName: 'Oggetto del pagamento',
      flex: 1,
      type: 'string'
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
      type: 'string'
    },
    {
      field: 'status',
      headerName: 'Stato',
      flex: 1,
      type: 'string',
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Chip
            label={params.row.chip.label}
            color={params.row.chip.color}
            variant="outlined"
          />
        );
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
        <IconButton
          aria-label={t('commons.detail')}
          onClick={() => {
            navigate(
              generatePath(PageRoutes.DEBT_POSITION_INSTALLMENT_DETAIL, {
                id: params.row.id
              }),
              {
                state: {
                  remittanceInformation: params.row.remittanceInformation
                }
              }
            );
          }}
        >
          <ReadMore fontSize="small" color="primary" />
        </IconButton>
      )
    }
  ];

  return (
    <Box mb={4}>
      <Box mb={3}>
        <TitleComponent
          variant="h6"
          sx={{ fontWeight: 700 }}
          title={optionData.title}
          chip={optionData.chip}
        />
      </Box>

      <Accordion
        disableGutters
        sx={{
          py: 1.5,
          bgcolor: theme.palette.background.paper,
          borderRadius: 2
        }}
      >
        <AccordionSummary
          expandIcon={<KeyboardArrowDown color="primary" />}
          aria-controls="payment-detail"
        >
          <Typography variant="overline" ml={1}>
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
          totalPages={1}
        />
      </Box>
    </Box>
  );
};
