import { OperatorsSelection } from '../../../generated/apiClient';
import { PaymentMethodOption } from './steps/Step2Behaviour/components/PaymentMethodSelector';

export type DebtTypeOrgForm = {
  // Step 1
  debtPositionTypeId: string;
  description: string;
  code: string;

  // Step 2
  flagSpontaneous?: boolean;

  flagMandatoryDueDate?: boolean;
  flagAnonymousFiscalCode?: boolean;

  // FREE if nothing is passed
  paymentMethod: PaymentMethodOption;

  amountCents?: number;
  externalPaymentUrl?: string;
  xsdDefinitionRef?: File;

  flagNotifyOutcomePush?: 'enabled' | 'disabled';

  // TODO Missing in api
  notificationRetries?: number;
  notificationAppName?: string;
  notificationEndpoint?: string;
  enableJwtAuth?: boolean;
  clientId?: string;
  clientEmail?: string;
  secretKeyId?: string;
  secretKey?: string;

  // TODO Missing in api
  authenticateUsername?: string;
  authenticatePassword?: string;
  authCallbackUrl?: string;
  updateCallbackUrl?: string;

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
};
