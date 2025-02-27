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
    successRoute: 'TELEMATIC_RECEIPT_IMPORT_FLOW_THANK_YOU_PAGE'
  },
  'reporting': {
    title: 'commons.importNewFlow',
    fileExtensionsAllowed: ['zip'],
    backRoute: 'REPORTING_IMPORT_OVERVIEW',
    successRoute: 'REPORTING_IMPORT_FLOW_THANK_YOU_PAGE'
  },
  'treasury': {
    title: 'commons.importNewFlow',
    fileExtensionsAllowed: ['zip'],
    backRoute: 'TREASURY',
    successRoute: 'REPORTING_IMPORT_FLOW_THANK_YOU_PAGE',
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
