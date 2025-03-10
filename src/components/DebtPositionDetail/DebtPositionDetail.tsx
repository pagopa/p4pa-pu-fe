import { Box, Typography, ChipOwnProps, Accordion, AccordionSummary, Chip } from '@mui/material';
import TitleComponent from '../TitleComponent/TitleComponent';
import CustomDataGrid from '../DataGrid/CustomDataGrid';
import { GridRenderCellParams } from '@mui/x-data-grid';
import { History, KeyboardArrowDown, ReadMore } from '@mui/icons-material';
import { theme} from '@pagopa/mui-italia';
import DetailContainer, { DetailData } from '../DetailContainer/DetailContainer';
import { moneyFormat } from '../../utils/formatters';
import { useTranslation } from 'react-i18next';

const DebtPositionDetail = () => {

  const { t } = useTranslation();

  // Mock Data for static implementation
  const mockData = {
    title: 'Pagamento Tari 2025',
    chip: {
      label: 'Da Pagare',
      color: 'info' as ChipOwnProps['color']
    },
    debtorInfo: [
      { label: t('commons.debtor'), value: 'Maria Bianchi' },
      { label: t('commons.fiscalCodeorVat'), value: 'BNCMRA82B42C933X (Persona fisica)' },
      { label: t('commons.duetype'), value: 'TARI' },
      { label: t('commons.internalCode'), value: '99999000013-64c8e41bfec8d6d99c92fc0fe989993' }
    ],
    soluzioneUnica: {
      title: t('commons.paymentOptions.oneOffPayment'),
      tag: 'Da pagare',
      details: [
        { label: t('commons.description'), value: 'Tari 2025 acconto' },
        { label: t('commons.amount') , value: 5000 }
      ],
      paymentOptions: [
        {
          iuv: '010000000000007525',
          subject: 'Saldo Tari 2025',
          amount: 5000,
          expirationDate: '24/03/2021',
          status: 'Da Pagare'
        }
      ]
    },
    soluzioneRate: {
      title: t('commons.paymentOptions.multiplePayments'),
      tag: 'Da pagare',
      details: [
        { label: t('commons.description'), value: 'Tari 2025 saldo' },
        { label: t('commons.amount'), value: 15000 }
      ],
      paymentOptions: [
        {
          iuv: '010000000000007526',
          subject: 'Saldo Tari 2025',
          amount: 5000,
          expirationDate: '24/03/2021',
          status: 'Da Pagare'
        },
        {
          iuv: '010000000000007527',
          subject: 'Saldo Tari 2025',
          amount: 5000,
          expirationDate: '24/03/2021',
          status: 'Da Pagare'
        },
        {
          iuv: '01000000000000752',
          subject: 'Saldo Tari 2025',
          amount: 5000,
          expirationDate: '24/03/2021',
          status: 'Da Pagare'
        }
      ]
    }
  };

  const debtorSection = {
    data: mockData.debtorInfo.map(item => ({
      label: item.label,
      value: item.value
    })) as DetailData[],
    inline: true
  };

  const soluzioneUnicaDetails = {
    data: mockData.soluzioneUnica.details.map(item => ({
      label: item.label,
      value: item.value
    })) as DetailData[],
    inline: true
  };

  const soluzioneRateDetails = {
    data: mockData.soluzioneRate.details.map(item => ({
      label: item.label,
      value: item.value,
    })) as DetailData[],
    inline: true
  };

  return (
    <>
      <TitleComponent 
        title={mockData.title}
        chip={mockData.chip}
        callToAction={[
          {
            icon: <History />,
            variant: 'text',
            onActionClick: () => console.log('History clicked')
          }
        ]}
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
          aria-controls="installment-payment-detail"
        >
          <Typography variant='overline' ml={1}>
            {t('debtPositionDetail.debtPositionInfo')}
          </Typography>
        </AccordionSummary>
        <DetailContainer sections={[debtorSection]} />
      </Accordion>

      <Typography variant="h5" sx={{ mb: 2 }}>{t('debtPositionDetail.paymentOptions')}</Typography>

      <Box sx={{ mb: 2 }}>
        <TitleComponent
          isSubtitle
          title={mockData.soluzioneUnica.title}
          chip={mockData.chip}
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
            aria-controls="single-payment-detail"
          >
            <Typography variant='overline' ml={1}>
              {t('debtPositionDetail.solutionDetail')}
            </Typography>
          </AccordionSummary>
          <DetailContainer sections={[soluzioneUnicaDetails]} />
        </Accordion>

        <Box sx={{ mt: 2 }}>
          <CustomDataGrid
            rows={mockData.soluzioneUnica.paymentOptions.map((option, index) => ({
              id: index,
              ...option
            }))}
            columns={[
              {
                field: 'iuv',
                headerName: 'Codice Avviso (IUV)',
                flex: 1,
              },
              {
                field: 'subject',
                headerName: 'Oggetto del pagamento',
                flex: 1,
              },
              {
                field: 'amount',
                headerName: 'Importo',
                flex: 0.5,
                renderCell: (params: GridRenderCellParams) =>
                  moneyFormat(params.value as number)
              },
              {
                field: 'expirationDate',
                headerName: 'Data scadenza',
                flex: 1,
              },
              {
                field: 'status',
                headerName: 'Stato',
                flex: 0.5,
                renderCell: (params: GridRenderCellParams) => (
                  <Chip label={params.row.status} color='info'/>
                )
              },
              {
                field: 'action',
                flex: 0.5,
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
                        console.log('ReadMore single solution Click id', params.row.iuv);
                      }}
                    />
                  </div>
                ),
              }
            ]}
            hideFooter={mockData.soluzioneUnica.paymentOptions.length <= 5}
            disableColumnMenu
            disableColumnResize
          />
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TitleComponent
          isSubtitle
          title={mockData.soluzioneRate.title}
          chip={mockData.chip}
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
            aria-controls="installment-payment-detail"
          >
            <Typography variant='overline' ml={1}>
              {t('debtPositionDetail.solutionDetail')}
            </Typography>
          </AccordionSummary>
          <DetailContainer sections={[soluzioneRateDetails]} />
        </Accordion>

        <Box sx={{ mt: 2 }}>
          <CustomDataGrid
            rows={mockData.soluzioneRate.paymentOptions.map((option, index) => ({
              id: index,
              ...option
            }))}
            columns={[
              {
                field: 'iuv',
                headerName: 'Codice Avviso (IUV)',
                flex: 1,
              },
              {
                field: 'subject',
                headerName: 'Oggetto del pagamento',
                flex: 1,
              },
              {
                field: 'amount',
                headerName: 'Importo',
                flex: 0.5,
                renderCell: (params: GridRenderCellParams) =>
                  moneyFormat(params.value as number)
              },
              {
                field: 'expirationDate',
                headerName: 'Data scadenza',
                flex: 1,
              },
              {
                field: 'status',
                headerName: 'Stato',
                flex: 0.5,
                renderCell: (params: GridRenderCellParams) => (
                  <Chip label={params.row.status} color='info'/>
                )
              },
              {
                field: 'action',
                headerName: '',
                flex: 0.5,
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
                        console.log('ReadMore multiple payment Click id', params.row.iuv);
                      }}
                    />
                  </div>
                ),
              }
            ]}
            hideFooter={mockData.soluzioneRate.paymentOptions.length <= 5}
            disableColumnMenu
            disableColumnResize
          />
        </Box>
      </Box>
    </>
  );
};

export default DebtPositionDetail;
