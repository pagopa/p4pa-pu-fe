import { OperatorsSelection } from '../../../generated/apiClient';

export enum PaymentMethodOption {
  FREE = 'free',
  AMOUNT = 'amount',
  CUSTOM = 'custom',
  EXTERNAL = 'external'
}

export enum SpontaneousMode {
  STANDARD = 'standard',
  CUSTOM_FORM = 'custom_form',
  EXTERNAL_URL = 'external_url'
}

export type DebtTypeOrgForm = {
  // Step 1
  debtPositionTypeId: string;
  description: string;
  code: string;
  isCodeUnique?: boolean;
  taxonomyCode?: string;

  // Step 2
  flagSpontaneous?: boolean;
  spontaneousMode?: SpontaneousMode;
  customFormId?: number;

  flagMandatoryDueDate?: boolean;
  flagAnonymousFiscalCode?: boolean;
  flagPresetAmount?: boolean;

  // FREE if nothing is passed
  paymentMethod: PaymentMethodOption;

  amountCents?: number;
  externalPaymentUrl?: string;
  xsdDefinitionRef?: Blob;

  flagNotifyOutcomePush?: 'enabled' | 'disabled';
  notifyOutcomePushOrgSilServiceId?: number;
  amountActualizationOrgSilServiceId?: number;

  // Step 3
  postalIban?: string;
  iban?: string;
  postalAccountCode?: string;
  holderPostalCc?: string;
  balance?: string;
  orgSector?: string;

  // Step 4
  flagNotifyIo?: boolean;
  serviceId?: string;
  ioTemplateSubject?: string;
  ioTemplateMessage?: string;

  // Step 5
  operatorsSelection: OperatorsSelection;
  enabledOperators?: Array<string>;
  disabledOperators?: Array<string>;
};
