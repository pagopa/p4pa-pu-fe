import { Beneficiary, Installment } from './paymentTypes';

import { PaymentOption } from './paymentTypes';

export type DebtPositionType = {
  label: string;
  value: string | number;
  flagMandatoryDueDate?: boolean;
  flagAnonymousFiscalCode?: boolean;
};

export type Step3Data = {
  paymentObject: { value: string; readonly: boolean };
  paymentOption: { value: PaymentOption; readonly: boolean };
  amount: { value: string; readonly: boolean };
  dueDate: { value: string | null; readonly: boolean };
  flagMandatoryDueDate: boolean;
  isMultibeneficiary: { value: boolean; readonly: boolean };
  beneficiaries?: Array<Beneficiary>;
  installments?: Array<Installment>;
  step1Data?: Step1Data;
  step2Data?: Step2Data;
};

export type Step2Data = {
  subjectType: { value: string; readonly: boolean }; // Subject type (individual/legal entity)
  anonymousSubject?: { value: boolean; readonly: boolean }; // Anonymous subject flag (when flagAnonymousFiscalCode is true)
  taxCode: { value: string; readonly: boolean }; // Tax code or VAT number
  fullName: { value: string; readonly: boolean }; // Full name
  address: { value: string; readonly: boolean }; // Address
  civicNumber: { value: string; readonly: boolean }; // Civic number
  zipCode: { value: string; readonly: boolean }; // Zip code
  country: { value: string; readonly: boolean }; // Country
  province: { value: string; readonly: boolean }; // Province
  city: { value: string; readonly: boolean }; // City
};

export type Step1Data = {
  debtPositionType: {
    value: string;
    flagMandatoryDueDate: boolean;
    flagAnonymousFiscalCode?: boolean;
    readonly: boolean;
  };
  description: {
    value: string;
    readonly: boolean;
  };
};

export enum DebtPositionTypeEnum {
  SINGLE = 'SINGLE',
  INSTALLMENTS = 'INSTALLMENTS'
}
