import { IngestionFlowFileType } from '../../generated/fileshare/fileshareClient';

type ImportFlowDetail = {
  title: string;
  fileExtensionsAllowed: Array<string>;
  backRoute: string;
  category: string;
  requiredFieldDescription?: string;
  flowTypes: Array<IngestionFlowFileType>;
  checkVersion: boolean;
  descriptionKey?: string;
  boxDescriptionKey?: string;
};

type ImportFlowDetails = Record<string, ImportFlowDetail>;

export const importFlowConfig: ImportFlowDetails = {
  'telematic-receipt': {
    title: 'commons.importNewFlow',
    fileExtensionsAllowed: ['zip'],
    backRoute: 'TELEMATIC_RECEIPT_IMPORT_OVERVIEW',
    category: 'telematic-receipt-import',
    flowTypes: [IngestionFlowFileType.RECEIPT],
    checkVersion: true,
    descriptionKey: 'commons.flowImport.descriptionByCategory.telematic-receipt'
  },
  reporting: {
    title: 'commons.importNewFlow',
    fileExtensionsAllowed: ['zip'],
    backRoute: 'REPORTING_IMPORT_OVERVIEW',
    category: 'reporting-import',
    flowTypes: [IngestionFlowFileType.PAYMENTS_REPORTING],
    checkVersion: false,
    descriptionKey: 'commons.flowImport.descriptionByCategory.reporting'
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
    ],
    checkVersion: true,
    descriptionKey: 'commons.flowImport.descriptionByCategory.treasury'
  },
  'debt-positions': {
    title: 'commons.importNewFlow',
    fileExtensionsAllowed: ['zip'],
    backRoute: 'DEBT_POSITIONS',
    category: 'debt-positions',
    flowTypes: [IngestionFlowFileType.DP_INSTALLMENTS],
    checkVersion: true,
    boxDescriptionKey: 'commons.flowImport.boxDescription'
  }
};
