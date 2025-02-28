interface ThankyouPage {
    title: string,
    description: string,
    routeID: string
  }
  
  type ThankyouOpts = Record<string, ThankyouPage>
  
export const ThankyouPageConfig: ThankyouOpts = {
  'default': {
    title: 'commons.successImport',
    description: 'reportingImportThankYouPage.description',
    routeID: 'TREASURY_IMPORT_OVERVIEW'
  },
  'reporting-import': {
    title: 'commons.successImport',
    description: 'reportingImportThankYouPage.description',
    routeID: 'REPORTING_IMPORT_OVERVIEW'
  },
  'telematic-receipt-export': {
    title: 'commons.successExport',
    description: 'telematicReceiptExportFlowThankYouPage.description',
    routeID: 'TELEMATIC_RECEIPT_EXPORT_OVERVIEW'
  },
  'telematic-receipt-import': {
    title: 'commons.successImport',
    description: 'telematicReceiptFlowImportThankYouPage.description',
    routeID: 'TELEMATIC_RECEIPT_IMPORT_OVERVIEW'
  },
  'treasury-import': {
    title: 'commons.successImport',
    description: 'reportingImportThankYouPage.description',
    routeID: 'TREASURY_IMPORT_OVERVIEW'
  },
};
  