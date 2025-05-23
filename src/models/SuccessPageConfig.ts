import { ButtonConfig } from '../components/ResponsePage/ResponsePage';

type SuccessPage = {
  title: string;
  description: string;
  buttonConfig?: Array<ButtonConfig>;
};

type SuccessOpts = Record<string, SuccessPage>;

export const SuccessPageConfig: SuccessOpts = {
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
  }
};
