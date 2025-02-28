interface ImportFlowDetail {
  title: string,
  fileExtensionsAllowed: string[],
  backRoute: string,
  successRoute: string,
  requiredFieldDescription?: string,
  flowTypes?: string[]
}

type ImportFlowDetails = Record<string, ImportFlowDetail>

export const importFlowConfig: ImportFlowDetails = {
  'telematic-receipt': {
    title: 'commons.importNewFlow',
    fileExtensionsAllowed: ['zip'],
    backRoute: 'TELEMATIC_RECEIPT_IMPORT_OVERVIEW',
    successRoute: 'telematic-receipt-import'
  },
  'reporting': {
    title: 'commons.importNewFlow',
    fileExtensionsAllowed: ['zip'],
    backRoute: 'REPORTING_IMPORT_OVERVIEW',
    successRoute: 'reporting-import'
  },
  'treasury': {
    title: 'commons.importNewFlow',
    fileExtensionsAllowed: ['zip'],
    backRoute: 'TREASURY',
    successRoute: 'treasury-import',
    requiredFieldDescription: 'commons.requiredFieldDescription',
    flowTypes: ['Giornale di Cassa XLS', 'Giornale di Cassa CSV', 'Giornale di Cassa OPI', 'Estrato conto poste']
  },
  'debt-positions': {
    title: 'commons.importNewFlow',
    fileExtensionsAllowed: ['zip'],
    backRoute: 'DEBT_POSITIONS',
    successRoute: 'REPORTING_IMPORT_FLOW_THANK_YOU_PAGE'
  }
};
