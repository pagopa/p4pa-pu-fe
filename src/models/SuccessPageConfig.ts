import { ButtonConfig } from '../components/ResponsePage/ResponsePage';

type SuccessPage = {
  title: string;
  description?: string;
  buttonConfig?: Array<ButtonConfig>;
};

type SuccessOpts = Record<string, SuccessPage>;

export const SuccessPageConfig: SuccessOpts = {
  'assessment-registry-update': {
    title: 'AssessmentRegistryUpdate.success.title',
    description: 'AssessmentRegistryUpdate.success.description',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'AssessmentRegistryUpdate.success.backToStart',
        actionID: 'ASSESSMENT_REGISTRY_SEARCH_RESULTS'
      }
    ]
  },
  'assessment-registry-create': {
    title: 'AssessmentRegistryCreate.success.title',
    description: 'AssessmentRegistryCreate.success.description',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'AssessmentRegistryCreate.success.backToStart',
        actionID: 'ASSESSMENT_REGISTRY_SEARCH_RESULTS'
      }
    ]
  },
  'reporting-import': {
    title: 'commons.successImport',
    description: 'reportingImportThankYouPage.description',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'commons.close',
        actionID: 'REPORTING_IMPORT_OVERVIEW'
      }
    ]
  },
  'telematic-receipt-export': {
    title: 'commons.successExport',
    description: 'commons.successExportDescription',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'commons.close',
        actionID: 'TELEMATIC_RECEIPT_EXPORT_OVERVIEW'
      }
    ]
  },
  'telematic-receipt-import': {
    title: 'commons.successImport',
    description: 'telematicReceiptFlowImportThankYouPage.description',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'commons.close',
        actionID: 'TELEMATIC_RECEIPT_IMPORT_OVERVIEW'
      }
    ]
  },
  'treasury-import': {
    title: 'commons.successImport',
    description: 'reportingImportThankYouPage.description',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'commons.close',
        actionID: 'TREASURY_IMPORT_OVERVIEW'
      }
    ]
  },
  'debt-positions': {
    title: 'commons.successImport',
    description: 'debtPositionsImportThankYouPage.description',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'commons.close',
        actionID: 'DEBT_POSITIONS'
      }
    ]
  },
  'conservation-export': {
    title: 'commons.successExport',
    description: 'commons.successExportDescription',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'commons.close',
        actionID: 'CONSERVATION'
      }
    ]
  },
  'debt-type-catalog-edit': {
    title: 'debtTypeCatalogEditSuccess.title',
    description: 'debtTypeCatalogEditSuccess.description',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'debtTypeCatalogEditSuccess.backToStart',
        actionID: 'DEBT_TYPES_CATALOG'
      }
    ]
  },
  'debt-type-catalog-create': {
    title: 'debtTypeCreateSuccess.title',
    description: 'debtTypeCreateSuccess.description',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'debtTypeCreateSuccess.backToStart',
        actionID: 'DEBT_TYPES_CATALOG'
      }
    ]
  },
  'debt-type-org-create': {
    title: 'debtTypeOrgCreate.success.title',
    description: 'debtTypeOrgCreate.success.description',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'commons.backToStart',
        actionID: 'DEBT_TYPES_DASHBOARD'
      }
    ]
  },
  'debt-type-org-update': {
    title: 'debtTypeOrgCreate.edit.success.title',
    description: 'debtTypeOrgCreate.edit.success.description',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'commons.backToStart',
        actionID: 'DEBT_TYPES_DASHBOARD'
      }
    ]
  },
  'classification-export': {
    title: 'commons.successExport',
    description: 'commons.successExportDescription',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'commons.close',
        actionID: 'CLASSIFICATIONS_EXPORT_OVERVIEW'
      }
    ]
  },
  'assessment-create': {
    title: 'assessmentCreate.success.title',
    description: 'assessmentCreate.success.description',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'assessmentCreate.success.goToDetail',
        customNavigation: 'ASSESSMENT_DETAIL'
      }
    ]
  },
  'assessment-remove-payments': {
    title: 'assessmentCreate.removePayments.success.title',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'assessmentCreate.removePayments.success.goToDetail',
        customNavigation: 'ASSESSMENT_DETAIL'
      }
    ]
  },
  'assessment-add-payments': {
    title: 'assessmentCreate.addPayments.success.title',
    description: 'assessmentCreate.addPayments.success.description',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'assessmentCreate.addPayments.success.goToDetail',
        customNavigation: 'ASSESSMENT_DETAIL'
      }
    ]
  },
  'client-sil': {
    title: 'clientSil.create.success.title',
    description: 'clientSil.create.success.description',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'clientSil.create.success.backToStart'
      }
    ]
  }
};
