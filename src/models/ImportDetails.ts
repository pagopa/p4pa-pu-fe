import { IngestionFlowFileType } from '../../generated/fileshare/fileshareClient';

interface ImportFlowDetail {
  title: string;
  fileExtensionsAllowed: string[];
  backRoute: string;
  category: string;
  requiredFieldDescription?: string;
  flowTypes: IngestionFlowFileType[];
}

type ImportFlowDetails = Record<string, ImportFlowDetail>;

export const importFlowConfig: ImportFlowDetails = {
  'telematic-receipt': {
    title: 'commons.importNewFlow',
    fileExtensionsAllowed: ['zip'],
    backRoute: 'TELEMATIC_RECEIPT_IMPORT_OVERVIEW',
    category: 'telematic-receipt-import',
    flowTypes: [IngestionFlowFileType.RECEIPT]
  },
  reporting: {
    title: 'commons.importNewFlow',
    fileExtensionsAllowed: ['zip'],
    backRoute: 'REPORTING_IMPORT_OVERVIEW',
    category: 'reporting-import',
    flowTypes: [IngestionFlowFileType.PAYMENTS_REPORTING]
  },
  treasury: {
    title: 'commons.importNewFlow',
    fileExtensionsAllowed: ['zip'],
    backRoute: 'TREASURY',
    category: 'treasury-import',
    requiredFieldDescription: 'commons.requiredFieldDescription',
    flowTypes: [
      IngestionFlowFileType.TREASURY_XLS,
      IngestionFlowFileType.TREASURY_CSV,
      IngestionFlowFileType.TREASURY_OPI,
      IngestionFlowFileType.TREASURY_POSTE
    ]
  },
  'debt-positions': {
    title: 'commons.importNewFlow',
    fileExtensionsAllowed: ['zip'],
    backRoute: 'DEBT_POSITIONS',
    category: 'debt-positions',
    flowTypes: [IngestionFlowFileType.DP_INSTALLMENTS]
  }
};
