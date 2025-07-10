import { useTranslation } from 'react-i18next';
import {
  COMPONENT_TYPE,
  FilterItem,
  SelectChangeEvent
} from '../components/FilterContainer/FilterContainer';
import { useStore } from '../store/GlobalStore';
import { ChangeEvent, useEffect, useMemo } from 'react';
import {
  noFilterIsSelected,
  noFilterSelectedExcludingClassificationType,
  removeAllFilters,
  setFilterValues
} from '../store/FilterStore';
import { FilterValues } from '../models/Filters';
import { LabelEnum } from '../../generated/apiClient';
import { useDebtPositionsTypeOrg } from './useDebtPositionsTypeOrg';

export enum FilterCategory {
  TREASURY = 'TREASURY',
  CLASSIFICATIONS = 'CLASSIFICATIONS',
  ASSESSMENT = 'ASSESSMENT'
}

export type FilterMap = Record<
  | keyof Omit<
      FilterValues,
      | 'ACCOUNTING_DATE_FROM'
      | 'ACCOUNTING_DATE_TO'
      | 'BILL_FROM'
      | 'BILL_DATE_FROM'
      | 'BILL_DATE_TO'
      | 'DOCUMENT_CODE_FROM'
      | 'TEMPORARY_CODE_FROM'
      | 'VALUE_DATE_FROM'
      | 'VALUE_DATE_TO'
      | 'REGION_VALUE_DATE_FROM'
      | 'REGION_VALUE_DATE_TO'
      | 'PAY_DATE_FROM'
      | 'PAY_DATE_TO'
      | 'LAST_CLASSIFICATION_DATE_FROM'
      | 'LAST_CLASSIFICATION_DATE_TO'
      | 'REGULATION_DATE_FROM'
      | 'REGULATION_DATE_TO'
      | 'PAYMENT_DATE_FROM'
      | 'PAYMENT_DATE_TO'
      | 'LAST_UPDATE_DATE_FROM'
      | 'LAST_UPDATE_DATE_TO'
    >
  | 'ACCOUNTING_DATE'
  | 'VALUE_DATE'
  | 'BILL_DATE'
  | 'REGION_VALUE_DATE'
  | 'PAY_DATE'
  | 'LAST_CLASSIFICATION_DATE'
  | 'REGULATION_DATE'
  | 'PAYMENT_DATE'
  | 'LAST_UPDATE_DATE',
  { label: string; fields: Array<FilterItem> }
>;

export const useMultiFilters = (props?: {
  clearOnMount?: boolean;
  filterCategory?: FilterCategory;
}) => {
  const { t } = useTranslation();
  const {
    state: { filterValues, selectedFilters, organizationId }
  } = useStore();

  const { optionsMap: debtTypesOptions } = useDebtPositionsTypeOrg({
    organizationId: organizationId || 0,
    includeAllOption: true,
    useCodeAsValue: true // for assessments we use the code (string)
  });

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

  const selectControl = (field: keyof typeof filterValues) => ({
    value: filterValues[field] as string,
    onChange: (e: SelectChangeEvent) =>
      setFilterValues({ ...filterValues, [field]: e.target.value })
  });

  const fullFilterMap: FilterMap = {
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
    ACCOUNT_REGISTRY_CODE: {
      label: t('classificationsExport.sections.treasury.accountRegistryCode'),
      fields: [
        {
          type: COMPONENT_TYPE.textField,
          label: t(
            'classificationsExport.sections.treasury.accountRegistryCode'
          ),
          ...fieldControl('ACCOUNT_REGISTRY_CODE')
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
    IUR: {
      label: t('commons.filters.iur.label'),
      fields: [
        {
          label: t('commons.filters.iur.code'),
          type: COMPONENT_TYPE.textField,
          ...fieldControl('IUR')
        }
      ]
    },
    IUD: {
      label: t('commons.filters.iud.label'),
      fields: [
        {
          label: t('commons.filters.iud.code'),
          type: COMPONENT_TYPE.textField,
          ...fieldControl('IUD')
        }
      ]
    },
    IUF: {
      label: t('commons.filters.iuf.label'),
      fields: [
        {
          label: t('commons.filters.iuf.code'),
          type: COMPONENT_TYPE.textField,
          ...fieldControl('IUF')
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
    },
    CLASSIFICATION_TYPE: {
      label: t('classifications.filters.classificationType'),
      fields: [
        {
          type: COMPONENT_TYPE.select,
          name: 'CLASSIFICATION_TYPE',
          label: t('classifications.filters.classificationType'),
          options: Object.values(LabelEnum).map((value) => ({
            label: t(`classificationsExport.classificationsOptions.${value}`),
            value
          })),
          required: true
        }
      ]
    },
    LAST_CLASSIFICATION_DATE: {
      label: t(
        'classificationsExport.sections.paymentClassification.lastUpdateDate'
      ),
      fields: [
        {
          type: COMPONENT_TYPE.dateRange,
          label: t('commons.filters.valueDate.date'),
          from: {
            label: t('dates.from'),
            ...dateControl('LAST_CLASSIFICATION_DATE_FROM')
          },
          to: {
            label: t('dates.to'),
            ...dateControl('LAST_CLASSIFICATION_DATE_TO')
          }
        }
      ]
    },
    REGULATION_DATE: {
      label: t('classificationsExport.sections.reporting.regulationDate'),
      fields: [
        {
          type: COMPONENT_TYPE.dateRange,
          label: t('commons.filters.valueDate.date'),
          from: {
            label: t('dates.from'),
            ...dateControl('REGULATION_DATE_FROM')
          },
          to: {
            label: t('dates.to'),
            ...dateControl('REGULATION_DATE_TO')
          }
        }
      ]
    },
    PAYMENT_DATE: {
      label: t('classificationsExport.sections.notice.paymentDateNotice'),
      fields: [
        {
          type: COMPONENT_TYPE.dateRange,
          label: t('commons.filters.valueDate.date'),
          from: {
            label: t('dates.from'),
            ...dateControl('PAYMENT_DATE_FROM')
          },
          to: {
            label: t('dates.to'),
            ...dateControl('PAYMENT_DATE_TO')
          }
        }
      ]
    },
    BILL_DATE: {
      label: t('classificationsExport.sections.treasury.accountDate'),
      fields: [
        {
          type: COMPONENT_TYPE.dateRange,
          label: t('commons.filters.accountingDate.date'),
          from: {
            label: t('dates.from'),
            ...dateControl('BILL_DATE_FROM')
          },
          to: {
            label: t('dates.to'),
            ...dateControl('BILL_DATE_TO')
          }
        }
      ]
    },
    REGULATION_UNIQUE_IDENTIFIER: {
      label: t(
        'classificationsExport.sections.reporting.regulationUniqueIdentifier'
      ),
      fields: [
        {
          type: COMPONENT_TYPE.textField,
          label: t('commons.searchRegulationUniqueIdentifier'),
          ...fieldControl('REGULATION_UNIQUE_IDENTIFIER')
        }
      ]
    },
    REMITTANCE_INFORMATION: {
      label: t('classificationsExport.sections.notice.remittanceInformation'),
      fields: [
        {
          type: COMPONENT_TYPE.textField,
          label: t(
            'classificationsExport.sections.notice.remittanceInformation'
          ),
          ...fieldControl('REMITTANCE_INFORMATION')
        }
      ]
    },
    PSP_COMPANY_NAME: {
      label: t('classificationsExport.sections.notice.applicant'),
      fields: [
        {
          type: COMPONENT_TYPE.textField,
          label: t('classificationsExport.sections.notice.applicant'),
          ...fieldControl('PSP_COMPANY_NAME')
        }
      ]
    },
    REGION_VALUE_DATE: {
      label: t('classificationsExport.sections.treasury.valueDate'),
      fields: [
        {
          type: COMPONENT_TYPE.dateRange,
          label: t('commons.filters.valueDate.date'),
          from: {
            label: t('dates.from'),
            ...dateControl('REGION_VALUE_DATE_FROM')
          },
          to: {
            label: t('dates.to'),
            ...dateControl('REGION_VALUE_DATE_TO')
          }
        }
      ]
    },
    PAY_DATE: {
      label: t('classificationsExport.sections.reporting.payDateReporting'),
      fields: [
        {
          type: COMPONENT_TYPE.dateRange,
          label: t('commons.filters.valueDate.date'),
          from: {
            label: t('dates.from'),
            ...dateControl('PAY_DATE_FROM')
          },
          to: {
            label: t('dates.to'),
            ...dateControl('PAY_DATE_TO')
          }
        }
      ]
    },
    ASSESSMENT_NAME: {
      label: t('assessment.filters.assessmentName'),
      fields: [
        {
          type: COMPONENT_TYPE.textField,
          label: t('assessment.filters.assessmentName'),
          ...fieldControl('ASSESSMENT_NAME')
        }
      ]
    },
    DEBT_TYPE: {
      label: t('assessment.filters.debtType'),
      fields: [
        {
          type: COMPONENT_TYPE.select,
          label: t('assessment.filters.debtType'),
          ...selectControl('DEBT_TYPE')
        }
      ]
    },
    ASSESSMENT_STATUS: {
      label: t('assessment.filters.status'),
      fields: [
        {
          type: COMPONENT_TYPE.select,
          label: t('assessment.filters.status'),
          options: [
            {
              label: t('assessment.statusOptions.ACTIVE'),
              value: 'ACTIVE'
            },
            { label: t('assessment.statusOptions.CLOSED'), value: 'CLOSED' },
            {
              label: t('assessment.statusOptions.CANCELLED'),
              value: 'CANCELLED'
            }
          ],
          ...selectControl('ASSESSMENT_STATUS')
        }
      ]
    },
    LAST_UPDATE_DATE: {
      label: t('assessment.filters.lastUpdateDate'),
      fields: [
        {
          type: COMPONENT_TYPE.dateRange,
          label: t('assessment.filters.lastUpdateDate'),
          from: {
            label: t('dates.from'),
            ...dateControl('LAST_UPDATE_DATE_FROM')
          },
          to: {
            label: t('dates.to'),
            ...dateControl('LAST_UPDATE_DATE_TO')
          }
        }
      ]
    }
  };

  const treasuryFilters: Array<keyof FilterMap> = [
    'ACCOUNTING_DATE',
    'AMOUNT',
    'BILL_CODE',
    'DOCUMENT_CODE',
    'IUV',
    'PAYER',
    'REPORT_ID',
    'VALUE_DATE'
  ];

  const classificationsFilters: Array<keyof FilterMap> = [
    'IUV',
    'IUR',
    'IUD',
    'IUF',
    'LAST_CLASSIFICATION_DATE',
    'REGULATION_DATE',
    'REGULATION_UNIQUE_IDENTIFIER',
    'REMITTANCE_INFORMATION',
    'PSP_COMPANY_NAME',
    'PAYMENT_DATE',
    'BILL_DATE',
    'REGION_VALUE_DATE',
    'ACCOUNT_REGISTRY_CODE',
    'AMOUNT',
    'PAY_DATE'
  ];

  const assessmentFilters: Array<keyof FilterMap> = [
    'ASSESSMENT_NAME',
    'DEBT_TYPE',
    'ASSESSMENT_STATUS',
    'LAST_UPDATE_DATE',
    'IUV'
  ];

  const getFilteredMap = (): FilterMap => {
    if (!props?.filterCategory) {
      return fullFilterMap;
    }

    let allowedFilters: Array<keyof FilterMap>;
    if (props.filterCategory === FilterCategory.TREASURY) {
      allowedFilters = treasuryFilters;
    } else if (props.filterCategory === FilterCategory.ASSESSMENT) {
      allowedFilters = assessmentFilters;
    } else {
      allowedFilters = classificationsFilters;
    }

    return Object.fromEntries(
      Object.entries(fullFilterMap).filter(([key]) =>
        allowedFilters.includes(key as keyof FilterMap)
      )
    ) as FilterMap;
  };

  const baseFilterMap = getFilteredMap();

  // Automatic enhancement for Assessment filters: populate the DEBT_TYPE options
  const enhancedFilterMap = useMemo(() => {
    if (
      props?.filterCategory === FilterCategory.ASSESSMENT &&
      baseFilterMap.DEBT_TYPE &&
      debtTypesOptions.length > 0
    ) {
      return {
        ...baseFilterMap,
        DEBT_TYPE: {
          ...baseFilterMap.DEBT_TYPE,
          fields: baseFilterMap.DEBT_TYPE.fields.map((field) => ({
            ...field,
            options: debtTypesOptions
          }))
        }
      };
    }
    return baseFilterMap;
  }, [baseFilterMap, debtTypesOptions, props?.filterCategory]);

  return {
    filterMap: enhancedFilterMap,
    selectedFilters,
    removeAllFilters,
    noFilterIsSelected,
    noFilterSelectedExcludingClassificationType,
    filterValues
  };
};
