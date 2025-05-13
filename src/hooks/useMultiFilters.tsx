import { useTranslation } from 'react-i18next';
import {
  COMPONENT_TYPE,
  FilterItem
} from '../components/FilterContainer/FilterContainer';
import { useStore } from '../store/GlobalStore';
import { ChangeEvent, useEffect } from 'react';
import {
  noFilterIsSelected,
  removeAllFilters,
  setFilterValues
} from '../store/FilterStore';
import { FilterValues } from '../models/Filters';

export type FilterMap = Record<
  | keyof Omit<
      FilterValues,
      | 'ACCOUNTING_DATE_FROM'
      | 'ACCOUNTING_DATE_TO'
      | 'BILL_FROM'
      | 'DOCUMENT_CODE_FROM'
      | 'TEMPORARY_CODE_FROM'
      | 'VALUE_DATE_FROM'
      | 'VALUE_DATE_TO'
    >
  | 'ACCOUNTING_DATE'
  | 'VALUE_DATE',
  { label: string; fields: Array<FilterItem> }
>;

export const useMultiFilters = (props?: { clearOnMount?: boolean }) => {
  const { t } = useTranslation();
  const {
    state: { filterValues, selectedFilters }
  } = useStore();

  useEffect(() => {
    if (props?.clearOnMount) {
      removeAllFilters();
    }
  }, []);

  const fieldControl = (field: keyof typeof filterValues) => ({
    value: filterValues[field] as string,
    onChange: (e: ChangeEvent<HTMLInputElement>) =>
      setFilterValues({ ...filterValues, [field]: e.target?.value })
  });

  const dateControl = (field: keyof typeof filterValues) => ({
    value: filterValues[field] as Date | null,
    onChange: (date: Date | null) =>
      setFilterValues({ ...filterValues, [field]: date })
  });

  const filterMap: FilterMap = {
    ACCOUNTING_DATE: {
      label: t('commons.filters.accountingDate.label'),
      fields: [
        {
          type: COMPONENT_TYPE.dateRange,
          label: t('commons.filters.accountingDate.date'),
          from: {
            label: t('dates.from'),
            ...dateControl('ACCOUNTING_DATE_FROM')
          },
          to: {
            label: t('dates.to'),
            ...dateControl('ACCOUNTING_DATE_TO')
          }
        }
      ]
    },
    AMOUNT: {
      label: t('commons.filters.amount.label'),
      fields: [
        {
          type: COMPONENT_TYPE.amount,
          label: t('commons.filters.amount.value'),
          ...fieldControl('AMOUNT')
        }
      ]
    },
    BILL_CODE: {
      label: t('commons.filters.bill.label'),
      fields: [
        {
          label: t('commons.filters.bill.code'),
          type: COMPONENT_TYPE.textField,
          gridWidth: 6,
          ...fieldControl('BILL_CODE')
        },
        {
          label: t('commons.filters.bill.date.label'),
          type: COMPONENT_TYPE.dateRange,
          from: {
            label: t('dates.year'),
            ...dateControl('BILL_FROM')
          },
          isYear: true,
          gridWidth: 6
        }
      ]
    },
    DOCUMENT_CODE: {
      label: t('commons.filters.documentCode.label'),
      fields: [
        {
          type: COMPONENT_TYPE.textField,
          label: t('commons.filters.documentCode.code'),
          gridWidth: 6,
          ...fieldControl('DOCUMENT_CODE')
        },
        {
          label: t('commons.filters.documentCode.label'),
          type: COMPONENT_TYPE.dateRange,
          from: {
            label: t('dates.year'),
            ...dateControl('DOCUMENT_CODE_FROM')
          },
          isYear: true,
          gridWidth: 6
        }
      ]
    },
    IUV: {
      label: t('commons.filters.iuv.label'),
      fields: [
        {
          label: t('commons.filters.iuv.code'),
          type: COMPONENT_TYPE.textField,
          ...fieldControl('IUV')
        }
      ]
    },
    PAYER: {
      label: t('commons.filters.payer.label'),
      fields: [
        {
          type: COMPONENT_TYPE.textField,
          label: t('commons.filters.payer.name'),
          ...fieldControl('PAYER')
        }
      ]
    },
    REPORT_ID: {
      label: t('commons.filters.reportId.label'),
      fields: [
        {
          type: COMPONENT_TYPE.textField,
          label: t('commons.filters.reportId.code'),
          ...fieldControl('REPORT_ID')
        }
      ]
    },
    TEMPORARY_CODE: {
      label: t('commons.filters.temporaryCode.label'),
      fields: [
        {
          type: COMPONENT_TYPE.textField,
          label: t('commons.filters.temporaryCode.code'),
          gridWidth: 6,
          ...fieldControl('TEMPORARY_CODE')
        },
        {
          label: t('commons.filters.temporaryCode.label'),
          type: COMPONENT_TYPE.dateRange,
          from: {
            ...dateControl('TEMPORARY_CODE_FROM'),
            label: t('dates.year')
          },
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
          from: {
            label: t('dates.from'),
            ...dateControl('VALUE_DATE_FROM')
          },
          to: {
            label: t('dates.to'),
            ...dateControl('VALUE_DATE_TO')
          }
        }
      ]
    }
  };

  return {
    filterMap,
    selectedFilters,
    removeAllFilters,
    noFilterIsSelected,
    filterValues
  };
};
