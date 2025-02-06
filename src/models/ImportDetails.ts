import { PageRoutes } from '../routes/routes';

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
    title: 'commons.routes.TELEMATIC_RECEIPT_IMPORT_FLOW',
    fileExtensionsAllowed: ['zip'],
    backRoute: PageRoutes.TELEMATIC_RECEIPT_IMPORT_OVERVIEW,
    successRoute: PageRoutes.TELEMATIC_RECEIPT_IMPORT_FLOW_THANK_YOU_PAGE
  },
  'reporting': {
    title: 'commons.routes.REPORTING_IMPORT_FLOW',
    fileExtensionsAllowed: ['zip'],
    backRoute: PageRoutes.REPORTING_IMPORT_OVERVIEW,
    successRoute: PageRoutes.REPORTING_IMPORT_FLOW_THANK_YOU_PAGE
  },
  'treasury': {
    title: 'commons.routes.TREASURY_IMPORT_FLOW',
    fileExtensionsAllowed: ['zip'],
    backRoute: PageRoutes.TREASURY,
    successRoute: PageRoutes.REPORTING_IMPORT_FLOW_THANK_YOU_PAGE,
    requiredFieldDescription: 'commons.requiredFieldDescription',
    flowTypes: ['Giornale di Cassa XLS', 'Giornale di Cassa CSV', 'Giornale di Cassa OPI', 'Estrato conto poste']
  }
};
