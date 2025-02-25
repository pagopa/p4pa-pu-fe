import { useTranslation } from 'react-i18next';
import { FilterItem, COMPONENT_TYPE } from '../components/FilterContainer/FilterContainer';

export type FilterMap = Record<string, { label: string; fields: FilterItem[] }>;

export const useFilters = () => {
  const { t } = useTranslation();

  const filterMap: FilterMap = {
    ACCOUNTING_DATE: {
      label: t('commons.filters.accountingDate.label'),
      fields: [
        {
          type: COMPONENT_TYPE.dateRange,
          label: t('commons.filters.accountingDate.date'),
          from: { label: t('dates.from') },
          to: { label: t('dates.to') }
        }
      ]
    },
    AMOUNT: {
      label: t('commons.filters.amount.label'),
      fields: [
        { type: COMPONENT_TYPE.amount, label: t('commons.filters.amount.value'), defaultValue: 0 }
      ]
    },
    BILL: {
      label: t('commons.filters.bill.label'),
      fields: [
        { label: t('commons.filters.bill.code'), type: COMPONENT_TYPE.textField, gridWidth: 6 },
        {
          label: t('commons.filters.bill.date.label'),
          type: COMPONENT_TYPE.dateRange,
          from: { label: t('dates.year') },
          isYear: true,
          gridWidth: 6
        }
      ]
    },
    DOCUMENT_CODE: {
      label: t('commons.filters.documentCode.label'),
      fields: [
        { type: COMPONENT_TYPE.textField, label: t('commons.filters.documentCode.code'), gridWidth: 6 },
        {
          label: t('commons.filters.documentCode.label'),
          type: COMPONENT_TYPE.dateRange,
          from: { label: t('dates.year') },
          isYear: true,
          gridWidth: 6
        }
      ]
    },
    IUV: {
      label: t('commons.filters.iuv.label'),
      fields: [{ label: t('commons.filters.iuv.code'), type: COMPONENT_TYPE.textField }]
    },
    PAYER: {
      label: t('commons.filters.payer.label'),
      fields: [{ type: COMPONENT_TYPE.textField, label: t('commons.filters.payer.name') }]
    },
    REPORT_ID: {
      label: t('commons.filters.reportId.label'),
      fields: [{ type: COMPONENT_TYPE.textField, label: t('commons.filters.reportId.code') }]
    },
    TEMPORARY_CODE: {
      label: t('commons.filters.temporaryCode.label'),
      fields: [
        { type: COMPONENT_TYPE.textField, label: t('commons.filters.temporaryCode.code'), gridWidth: 6 },
        {
          label: t('commons.filters.temporaryCode.label'),
          type: COMPONENT_TYPE.dateRange,
          from: { label: t('dates.year') },
          isYear: true,
          gridWidth: 6
        }
      ]
    },
    VALUE_DATE: {
      label: t('commons.filters.valueDate.label'),
      fields: [
        {
          type: COMPONENT_TYPE.dateRange,
          label: t('commons.filters.valueDate.date'),
          from: { label: t('dates.from') },
          to: { label: t('dates.to') }
        }
      ]
    }
  };

  return filterMap;
};
