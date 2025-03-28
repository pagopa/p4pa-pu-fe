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

export type FilterMap = Record<
  string,
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

  const fieldControl = <V, C = V | null>(
    field: keyof typeof filterValues,
    extract: (value: C) => V | C = (v: C) => v
  ) => ({
    value: filterValues[field] as V,
    onChange: (value: C) =>
      setFilterValues({ ...filterValues, [field]: extract(value) })
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
            ...fieldControl<Date>('ACCOUNTING_DATE_FROM')
          },
          to: {
            label: t('dates.to'),
            ...fieldControl<Date>('ACCOUNTING_DATE_TO')
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
          ...fieldControl<string, ChangeEvent<HTMLInputElement>>(
            'AMOUNT',
            (v) => v.target.value
          )
        }
      ]
    },
    BILL: {
      label: t('commons.filters.bill.label'),
      fields: [
        {
          label: t('commons.filters.bill.code'),
          type: COMPONENT_TYPE.textField,
          gridWidth: 6,
          ...fieldControl<string, ChangeEvent<HTMLInputElement>>(
            'BILL_CODE',
            (v) => v.target.value
          )
        },
        {
          label: t('commons.filters.bill.date.label'),
          type: COMPONENT_TYPE.dateRange,
          from: {
            label: t('dates.year'),
            ...fieldControl<Date>('BILL_FROM')
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
          ...fieldControl<string, ChangeEvent<HTMLInputElement>>(
            'DOCUMENT_CODE',
            (v) => v.target.value
          )
        },
        {
          label: t('commons.filters.documentCode.label'),
          type: COMPONENT_TYPE.dateRange,
          from: {
            label: t('dates.year'),
            ...fieldControl<Date>('DOCUMENT_CODE_FROM')
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
          ...fieldControl<string, ChangeEvent<HTMLInputElement>>(
            'IUV',
            (v) => v.target.value
          )
        }
      ]
    },
    PAYER: {
      label: t('commons.filters.payer.label'),
      fields: [
        {
          type: COMPONENT_TYPE.textField,
          label: t('commons.filters.payer.name'),
          ...fieldControl<string, ChangeEvent<HTMLInputElement>>(
            'PAYER',
            (v) => v.target.value
          )
        }
      ]
    },
    REPORT_ID: {
      label: t('commons.filters.reportId.label'),
      fields: [
        {
          type: COMPONENT_TYPE.textField,
          label: t('commons.filters.reportId.code'),
          ...fieldControl<string, ChangeEvent<HTMLInputElement>>(
            'REPORT_ID',
            (v) => v.target.value
          )
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
          ...fieldControl<string, ChangeEvent<HTMLInputElement>>(
            'TEMPORARY_CODE',
            (v) => v.target.value
          )
        },
        {
          label: t('commons.filters.temporaryCode.label'),
          type: COMPONENT_TYPE.dateRange,
          from: {
            label: t('dates.year'),
            ...fieldControl<Date>('TEMPORARY_CODE_FROM')
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
            ...fieldControl<Date>('VALUE_DATE_FROM')
          },
          to: {
            label: t('dates.to'),
            ...fieldControl<Date>('VALUE_DATE_TO')
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
