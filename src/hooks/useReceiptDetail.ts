import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getReceiptDetail } from '../api/receiptDetail';
import { moneyFormat } from '../utils/formatters';
import { DetailData } from '../components/DetailContainer/DetailContainer';
import notify from '../utils/notify';

type UseReceiptDetailReturn = {
  summaryData: Array<DetailData>;
  paymentData: Array<DetailData>;
  isLoading: boolean;
  isError: boolean;
};

export const useReceiptDetail = (
  organizationId: number,
  receiptId: number
): UseReceiptDetailReturn => {
  const { t } = useTranslation();

  const { data, isLoading, isError } = getReceiptDetail(
    organizationId,
    receiptId
  );

  if (isError) {
    notify.emit(t('commons.genericError'));
  }

  const summaryData = useMemo(() => {
    if (!data) return [];

    const debtorType: string =
      data?.debtor?.entityType === 'F' ? `(${t('commons.person')})` : '';

    const baseSummary: Array<DetailData> = [
      { label: t('commons.iuv'), value: data.iuv || '-' },
      {
        label: t('commons.amount'),
        value: moneyFormat(data.paymentAmountCents) || '-'
      },
      { label: t('commons.reason'), value: data.remittanceInformation || '-' },
      {
        label: t('commons.duetype'),
        value: data.debtPositionTypeOrgDescription || '-'
      },
      { label: t('commons.debtor'), value: data.debtor?.fullName || '-' },
      {
        label: t('commons.fiscalCodeorVat'),
        value: `${data.debtor?.fiscalCode || '-'} ${debtorType}`
      }
    ];

    if (data.notificationFeeCents !== undefined) {
      baseSummary.push({
        label: t('commons.notificationFeeCents'),
        value: String(data.notificationFeeCents),
        valueType: 'amount'
      });
    }

    return baseSummary;
  }, [data, t]);

  const paymentData = useMemo(() => {
    if (!data) return [];

    return [
      {
        label: t('commons.paymentdate'),
        value: data.paymentDateTime
          ? new Date(data.paymentDateTime).toLocaleDateString('it-IT')
          : '-'
      },
      { label: t('commons.psp'), value: data.pspCompanyName || '-' },
      { label: t('commons.iud'), value: data.iud || '-' },
      { label: t('commons.iur'), value: data.iur || '-' }
    ];
  }, [data, t]);

  return { summaryData, paymentData, isLoading, isError };
};
