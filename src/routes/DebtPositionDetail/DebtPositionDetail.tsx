import { Box, Typography, Accordion, AccordionSummary, ChipOwnProps } from '@mui/material';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { History, KeyboardArrowDown } from '@mui/icons-material';
import { theme } from '@pagopa/mui-italia';
import DetailContainer, { DetailData } from '../../components/DetailContainer/DetailContainer';
import { useTranslation } from 'react-i18next';
import { PaymentOptionSection } from './components/PaymentOptionSection';
import { mockData } from './mocks/apiResponse';

interface Debtor {
  entityType: string;
  fiscalCode: string;
  fullName: string;
  address: string;
  civic: string;
  postalCode: string;
  location: string;
  province: string;
  nation: string;
  email: string;
}

interface SyncStatus {
  syncStatusFrom: string;
  syncStatusTo: string;
}

interface Transfer {
  transferId: number;
  installmentId: number;
  orgFiscalCode: string;
  orgName: string;
  amountCents: number;
  remittanceInformation: string;
  stampType: string;
  stampHashDocument: string;
  stampProvincialResidence: string;
  iban: string;
  postalIban: string;
  category: string;
  transferIndex: number;
}

interface Installment {
  installmentId: number;
  paymentOptionId: number;
  status: string;
  syncStatus: SyncStatus;
  iupdPagopa: string;
  iud: string;
  iuv: string;
  iur: string;
  nav: string;
  dueDate: string;
  paymentTypeCode: string;
  amountCents: number;
  remittanceInformation: string;
  balance: string;
  legacyPaymentMetadata: string;
  debtor: Debtor;
  transfers: Transfer[];
  creationDate: string;
  updateDate: string;
}

interface PaymentOption {
  paymentOptionId: number;
  debtPositionId: number;
  totalAmountCents: number;
  status: string;
  dueDate: string;
  description: string;
  paymentOptionType: 'SINGLE_INSTALLMENT' | 'INSTALLMENTS';
  paymentOptionIndex: number;
  installments: Installment[];
}

export interface DebtPosition {
  debtor: Debtor;
  debtPositionTypeOrgDescription: string;
  debtPositionTypeOrgCode: string;
  iupd: string;
  status: string;
  paymentOptions: PaymentOption[];
}

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

const DebtPositionDetail = () => {
  const { t } = useTranslation();

  const getStatusChipProps = (status: string): { label: string; color: ChipOwnProps['color'] } => {
    switch (status) {
    case 'PAID':
      return { label: t('DebtPositions.Results.status.PAID'), color: 'success' };
    case 'UNPAID':
      return { label: t('DebtPositions.Results.status.UNPAID'), color: 'error' };
    case 'REPORTED':
    default:
      return { label: t('DebtPositions.Results.status.REPORTED'), color: 'info' };
    }
  };

  const statusChip = getStatusChipProps(mockData.status);

  const debtorSection = {
    data: [
      { label: t('commons.debtor'), value: mockData.debtor.fullName },
      {
        label: t('commons.fiscalCodeorVat'),
        value: `${mockData.debtor.fiscalCode} (${mockData.debtor.entityType === 'F' ? 'Persona fisica' : 'Persona giuridica'})`
      },
      { label: t('commons.duetype'), value: mockData.debtPositionTypeOrgDescription },
      { label: t('commons.internalCode'), value: mockData.iupd }
    ] as DetailData[],
    inline: true
  };

  const createInstallmentRow = (installment: Installment, description: string): InstallmentRow => ({
    id: installment.installmentId,
    iuv: installment.iuv,
    subject: installment.remittanceInformation || description,
    amount: installment.amountCents,
    expirationDate: installment.dueDate,
    status: getStatusChipProps(installment.status).label
  });

  const createPaymentOptionDisplayData = (paymentOption: PaymentOption): PaymentOptionDisplayData => {
    const isSingleInstallment = paymentOption.paymentOptionType === 'SINGLE_INSTALLMENT';
    return {
      title: isSingleInstallment 
        ? t('commons.paymentOptions.oneOffPayment') 
        : t('commons.paymentOptions.multiplePayments'),
      tag: getStatusChipProps(paymentOption.status).label,
      chip: getStatusChipProps(paymentOption.status),
      details: [
        { label: t('commons.description'), value: paymentOption.description },
        { label: t('commons.amount'), value: paymentOption.totalAmountCents }
      ],
      installments: paymentOption.installments.map(installment => 
        createInstallmentRow(installment, paymentOption.description)
      )
    };
  };

  const groupedPaymentOptions = {
    singleInstallments: mockData.paymentOptions.filter(option => 
      option.paymentOptionType === 'SINGLE_INSTALLMENT'
    ),
    multipleInstallments: mockData.paymentOptions.filter(option => 
      option.paymentOptionType === 'INSTALLMENTS'
    )
  };

  const paymentOptionsDisplayData = {
    singleInstallments: groupedPaymentOptions.singleInstallments.map(createPaymentOptionDisplayData),
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

      {paymentOptionsDisplayData.singleInstallments.length > 0 && (
        <>
          {paymentOptionsDisplayData.singleInstallments.map((optionData, index) => (
            <PaymentOptionSection key={`single-${index}`} optionData={optionData} />
          ))}
        </>
      )}

      {paymentOptionsDisplayData.multipleInstallments.length > 0 && (
        <>
          {paymentOptionsDisplayData.multipleInstallments.map((optionData, index) => (
            <PaymentOptionSection key={`multiple-${index}`} optionData={optionData} />
          ))}
        </>
      )}
    </>
  );
};

export default DebtPositionDetail;
