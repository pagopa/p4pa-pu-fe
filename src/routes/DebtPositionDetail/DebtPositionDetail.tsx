import { Box, Typography, Accordion, AccordionSummary, ChipOwnProps, ChipProps } from '@mui/material';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { History, KeyboardArrowDown } from '@mui/icons-material';
import { theme } from '@pagopa/mui-italia';
import DetailContainer, { DetailData } from '../../components/DetailContainer/DetailContainer';
import { useTranslation } from 'react-i18next';
import { PaymentOptionSection } from './components/PaymentOptionSection';
import { mockData } from './mocks/apiResponse';
import { format, parseISO } from 'date-fns';
import { 
  PaymentOptionDTO, 
  InstallmentDTO 
} from '../../../generated/apiClient';

export interface PaymentOptionDisplayData {
  title: string;
  tag: string;
  chip: { label: string; color: ChipOwnProps['color'] };
  details: DetailData[];
  installments: InstallmentRow[];
}

interface InstallmentRow {
  id: number;
  iuv: string;
  subject: string;
  amount: number;
  expirationDate: string;
  status: string;
}

const PaymentOptionTypes = {
  SINGLE_INSTALLMENT: 'SINGLE_INSTALLMENT',
  INSTALLMENTS: 'INSTALLMENTS',
  DOWN_PAYMENT: 'DOWN_PAYMENT'
} as const;

const DebtPositionDetail = () => {
  const { t } = useTranslation();

  const stateColors: Record<string, ChipProps['color']> = {
    CANCELLED: 'error',
    DRAFT: 'default',
    EXPIRED: 'error',
    PAID: 'success',
    PARTIALLY_PAID: 'info',
    REPORTED: 'success',
    TO_SYNC: 'default',
    UNPAID: 'info'
  };
  
type StateKey = keyof typeof stateColors;

const getStatusChipProps = (status: string): { label: string; color: ChipOwnProps['color'] } => {
  const isValidStatus = Object.keys(stateColors).includes(status);
  
  if (!isValidStatus) {
    return {
      label: 'STATO SCONOSCIUTO',
      color: 'default'
    };
  }
  
  const statusKey = status as StateKey;
  return {
    label: t(`DebtPositions.Results.status.${statusKey}`) || status,
    color: stateColors[statusKey]
  };
};

const statusChip = getStatusChipProps(mockData.status);

const debtorSection = {
  data: [
    { label: t('commons.debtor'), value: mockData.debtor.fullName },
    {
      label: t('commons.fiscalCodeorVat'),
      value: `${mockData.debtor.fiscalCode} (${mockData.debtor.entityType === 'F' ? t('commons.person') : t('commons.personLegal')})`
    },
    { label: t('commons.duetype'), value: mockData.debtPositionTypeOrgDescription },
    { label: t('commons.internalCode'), value: mockData.iupd }
  ] as DetailData[],
  inline: true
};

const createInstallmentRow = (installment: InstallmentDTO, description: string): InstallmentRow => {
  return {
    id: installment.installmentId ?? 0,
    iuv: installment.iuv ?? 'N/A',
    subject: installment.remittanceInformation || description || 'N/A',
    amount: installment.amountCents ?? 0,
    expirationDate: installment.dueDate 
      ? format(parseISO(installment.dueDate), 'dd/MM/yyyy') 
      : 'N/A',
    status: installment.status 
      ? getStatusChipProps(installment.status).label 
      : 'N/A'
  };
};

const getPaymentOptionTitle = (paymentOptionType: string): string => {
  switch (paymentOptionType) {
  case PaymentOptionTypes.SINGLE_INSTALLMENT:
    return t('commons.paymentOptions.SINGLE_INSTALLMENT');
  case PaymentOptionTypes.INSTALLMENTS:
    return t('commons.paymentOptions.INSTALLMENTS');
  case PaymentOptionTypes.DOWN_PAYMENT:
    return t('commons.paymentOptions.DOWN_PAYMENT');
  default:
    return '';
  }
};

const createPaymentOptionDisplayData = (paymentOption: PaymentOptionDTO): PaymentOptionDisplayData => {
  return {
    title: paymentOption.paymentOptionType 
      ? getPaymentOptionTitle(paymentOption.paymentOptionType) 
      : 'N/A',
    tag: paymentOption.status 
      ? getStatusChipProps(paymentOption.status).label 
      : 'N/A',
    chip: paymentOption.status 
      ? getStatusChipProps(paymentOption.status) 
      : { label: 'N/A', color: 'default' },
    details: [
      { 
        label: t('commons.description'), 
        value: paymentOption.description ?? 'N/A' 
      },
      { 
        label: t('commons.amount'), 
        value: paymentOption.totalAmountCents ?? 0 
      }
    ],
    installments: (paymentOption.installments ?? [])
      .map(installment => createInstallmentRow(installment, paymentOption.description ?? ''))
  };
};

const groupedPaymentOptions = {
  singleInstallments: mockData.paymentOptions.filter(option => 
    option.paymentOptionType === PaymentOptionTypes.SINGLE_INSTALLMENT
  ),
  downPayments: mockData.paymentOptions.filter(option => 
    option.paymentOptionType === PaymentOptionTypes.DOWN_PAYMENT
  ),
  multipleInstallments: mockData.paymentOptions.filter(option => 
    option.paymentOptionType === PaymentOptionTypes.INSTALLMENTS
  )
};

const paymentOptionsDisplayData = {
  singleInstallments: groupedPaymentOptions.singleInstallments.map(createPaymentOptionDisplayData),
  downPayments: groupedPaymentOptions.downPayments.map(createPaymentOptionDisplayData),
  multipleInstallments: groupedPaymentOptions.multipleInstallments.map(createPaymentOptionDisplayData)
};

return (
  <>
    <TitleComponent
      title={mockData.debtPositionTypeOrgDescription}
      chip={statusChip}
      callToAction={[
        {
          icon: <History />,
          variant: 'text',
          onActionClick: () => console.log('History clicked')
        }
      ]}
    />
    <Box mt={3}>
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
          aria-controls="debt-position-detail"
        >
          <Typography variant='overline' ml={1}>
            {t('debtPositionDetail.debtPositionInfo')}
          </Typography>
        </AccordionSummary>
        <DetailContainer sections={[debtorSection]} />
      </Accordion>

      <Typography variant="h5" mb={2} mt={3}>{t('debtPositionDetail.paymentOptions')}</Typography>
    </Box>

    {/* Opzioni di pagamento a rata unica */}
    {paymentOptionsDisplayData.singleInstallments.length > 0 && (
      <>
        {paymentOptionsDisplayData.singleInstallments.map((optionData, index) => (
          <PaymentOptionSection 
            key={`single-${index}`} 
            optionData={optionData} 
            data-testid="single-installment-section" 
          />
        ))}
      </>
    )}

    {/* Opzioni di pagamento per anticipo */}
    {paymentOptionsDisplayData.downPayments.length > 0 && (
      <>
        {paymentOptionsDisplayData.downPayments.map((optionData, index) => (
          <PaymentOptionSection 
            key={`down-payment-${index}`} 
            optionData={optionData} 
            data-testid="down-payment-section" 
          />
        ))}
      </>
    )}

    {/* Opzioni di pagamento per rate multiple */}
    {paymentOptionsDisplayData.multipleInstallments.length > 0 && (
      <>
        {paymentOptionsDisplayData.multipleInstallments.map((optionData, index) => (
          <PaymentOptionSection 
            key={`multiple-${index}`} 
            optionData={optionData} 
            data-testid="multiple-installments-section" 
          />
        ))}
      </>
    )}
  </>
);
};

export default DebtPositionDetail;
