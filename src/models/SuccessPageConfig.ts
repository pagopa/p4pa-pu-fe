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
        buttonLabel: 'AssessmentRegistryUpdate.success.goToDetail',
        customNavigation: 'ASSESSMENT_REGISTRY_DETAIL'
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
        buttonLabel: 'AssessmentRegistryCreate.success.goToDetail',
        customNavigation: 'ASSESSMENT_REGISTRY_DETAIL'
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
  'debt-type-delete-success': {
    title: 'debtTypeCatalogDetail.successPage.title',
    description: 'debtTypeCatalogDetail.successPage.description',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'debtTypeCatalogDetail.successPage.backToCatalog',
        actionID: 'DEBT_TYPES_CATALOG'
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
  'assessment-create-partial-success': {
    title: 'assessmentCreate.partialSuccess.title',
    description: 'assessmentCreate.partialSuccess.description',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'assessmentCreate.partialSuccess.goToDetail',
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
        buttonLabel: 'clientSil.create.success.goToDetail',
        customNavigation: 'CLIENT_SIL_DETAIL'
      }
    ]
  },
  'org-sil-service-create': {
    title: 'orgSilServiceCreate.newService.success.title',
    description: 'orgSilServiceCreate.newService.success.description',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'orgSilServiceCreate.newService.success.goToDetail',
        customNavigation: 'ORG_SIL_SERVICE_DETAIL'
      }
    ]
  },
  'org-sil-service-edit': {
    title: 'orgSilServiceEdit.updateService.success.title',
    description: 'orgSilServiceEdit.updateService.success.description',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'orgSilServiceEdit.updateService.success.goToDetail',
        customNavigation: 'ORG_SIL_SERVICE_DETAIL'
      }
    ]
  },
  'operator-affiliate': {
    title: 'OperatorDetail.affiliate.success.title',
    description: 'OperatorDetail.affiliate.success.description',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'OperatorDetail.affiliate.success.buttonLabel',
        customNavigation: 'OPERATORS_DETAIL'
      }
    ]
  },
  'client-sil-delete-success': {
    title: 'clientSil.successPage.title',
    description: 'clientSil.successPage.description',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'clientSil.successPage.backToCatalog',
        actionID: 'CLIENT_SIL_INDEX'
      }
    ]
  }
};
