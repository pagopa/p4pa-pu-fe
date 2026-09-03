import { useTranslation } from 'react-i18next';
import {
  COMPONENT_TYPE,
  SelectChangeEvent
} from '../components/FilterContainer/FilterContainer';
import { FilterMap } from './useMultiFilters';
import { useStore } from '../store/GlobalStore';
import { ChangeEvent } from 'react';
import { setFilterValues } from '../store/FilterStore';
import { getDebtPositionTypeOrgs } from '../api/debtPositionsTypeOrg';
import { LabelEnum } from '../../generated/core/client';
import { AssessmentsRegistryStatus } from '../../generated/core/data-contracts';
import { FilterFieldValue } from '../models/Filters';

export const useFullListMultifilters = () => {
  const { t } = useTranslation();

  const {
    state: { filterValues, organizationId }
  } = useStore();

  const fieldControl = (field: keyof typeof filterValues) => ({
    value: filterValues[field] as string,
    onChange: (e: ChangeEvent<HTMLInputElement> | SelectChangeEvent) =>
      setFilterValues({ ...filterValues, [field]: e.target?.value })
  });

  const selectControl = (field: keyof typeof filterValues) => ({
    value: filterValues[field] as string,
    onChange: (value: FilterFieldValue) =>
      setFilterValues({ ...filterValues, [field]: value })
  });

  const dateControl = (field: keyof typeof filterValues) => ({
    value: filterValues[field] as Date | null,
    onChange: (date: Date | null) =>
      setFilterValues({ ...filterValues, [field]: date })
  });

  const debtPositionTypeOrgsControl = (field: keyof typeof filterValues) => {
    const { data } = getDebtPositionTypeOrgs({
      organizationId
    });

    const options = data
      ?.slice()
      .sort((a, b) => a.description.localeCompare(b.description))
      .map((type) => ({
        label: type.description,
        value: type.code
      }));

    return {
      ...selectControl(field),
      options
    };
  };

  const fullFilterMap: FilterMap = {
    /** please keep this object sorted by keyname */
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
    ASSESSMENT_CODE: {
      label: t('commons.filters.assessmentCode'),
      fields: [
        {
          type: COMPONENT_TYPE.textField,
          label: t('commons.filters.assessmentCode'),
          ...fieldControl('ASSESSMENT_CODE')
        }
      ]
    },
    ASSESSMENT_DESCRIPTION: {
      label: t('commons.filters.assessmentDescription'),
      fields: [
        {
          type: COMPONENT_TYPE.textField,
          label: t('commons.filters.assessmentDescription'),
          ...fieldControl('ASSESSMENT_DESCRIPTION')
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
    ASSESSMENT_STATUS: {
      label: t('assessment.filters.status'),
      fields: [
        {
          type: COMPONENT_TYPE.select,
          label: t('assessment.filters.status'),
          options: [
            { label: t('assessment.statusOptions.ACTIVE'), value: 'ACTIVE' },
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
          required: true,
          ...selectControl('CLASSIFICATION_TYPE')
        }
      ]
    },
    DEBT_POSITION_TYPE_ORG_CODE: {
      label: t('commons.filters.debtPositionType'),
      fields: [
        {
          type: COMPONENT_TYPE.select,
          name: 'DEBT_POSITION_TYPE_ORG_CODE',
          label: t('commons.filters.debtPositionType'),
          ...debtPositionTypeOrgsControl('DEBT_POSITION_TYPE_ORG_CODE')
        }
      ]
    },
    DEBT_TYPE: {
      label: t('assessment.filters.debtType'),
      fields: [
        {
          type: COMPONENT_TYPE.select,
          label: t('assessment.filters.debtType'),
          ...debtPositionTypeOrgsControl('DEBT_TYPE')
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
    },
    OFFICE_CODE: {
      label: t('commons.filters.officeCode'),
      fields: [
        {
          type: COMPONENT_TYPE.textField,
          label: t('commons.filters.officeCode'),
          ...fieldControl('OFFICE_CODE')
        }
      ]
    },
    OFFICE_DESCRIPTION: {
      label: t('commons.filters.officeDescription'),
      fields: [
        {
          type: COMPONENT_TYPE.textField,
          label: t('commons.filters.officeDescription'),
          ...fieldControl('OFFICE_DESCRIPTION')
        }
      ]
    },
    OPERATING_YEAR: {
      label: t('commons.filters.operatingYear'),
      fields: [
        {
          type: COMPONENT_TYPE.dateRange,
          label: t('commons.filters.operatingYear'),
          isYear: true,
          from: {
            label: t('commons.filters.operatingYear'),
            ...dateControl('OPERATING_YEAR')
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
    SECTION_CODE: {
      label: t('commons.filters.sectionCode'),
      fields: [
        {
          type: COMPONENT_TYPE.textField,
          label: t('commons.filters.sectionCode'),
          ...fieldControl('SECTION_CODE')
        }
      ]
    },
    SECTION_DESCRIPTION: {
      label: t('commons.filters.sectionDescription'),
      fields: [
        {
          type: COMPONENT_TYPE.textField,
          label: t('commons.filters.sectionDescription'),
          ...fieldControl('SECTION_DESCRIPTION')
        }
      ]
    },
    STATUS: {
      label: t('commons.filters.status'),
      fields: [
        {
          type: COMPONENT_TYPE.select,
          name: 'STATUS',
          label: t('commons.filters.status'),
          options: Object.values(AssessmentsRegistryStatus).map((value) => ({
            label: t(`commons.status.${value}`),
            value
          })),
          required: true,
          ...selectControl('STATUS')
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

  return fullFilterMap;
};
