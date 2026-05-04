// Language options for additional language select
export const LANGUAGE_OPTIONS = {
  EN: 'en',
  FR: 'fr',
  DE: 'de'
} as const;

export type LanguageCode =
  (typeof LANGUAGE_OPTIONS)[keyof typeof LANGUAGE_OPTIONS];

export type FieldData<T> = {
  value: T;
  readonly: boolean;
};

export type OrganizationEditStep1Data = {
  orgName: FieldData<string>;
  orgFiscalCode: FieldData<string>;
  orgEmail: FieldData<string>;
  orgLogo: FieldData<string | null>;
  logoRemoved: boolean; // Flag to track if user explicitly removed the logo
  organizationStatus?: string; // Organization status for conditional validation
};

export type OrganizationEditStep2Data = {
  // Accounting Information
  iban: FieldData<string>;
  ibanPostal: FieldData<string>;
  cbill: FieldData<string>;
  flagTreasury: FieldData<boolean>;
  // Payments Information
  segregationCode: FieldData<string>;
  generateNoticeApiKey: FieldData<string>;
  additionalLanguage: FieldData<boolean>;
  selectedLanguage: FieldData<string>;
  flagNotifyOutcomePush: FieldData<boolean | null>;
  flagPaymentNotification: FieldData<boolean | null>;
  // PagoPA Products Integration
  flagNotifyIo: FieldData<boolean>;
  ioApiKey: FieldData<string>;
  pdndEnabled: FieldData<boolean>;
  sendApiKey: FieldData<string>;
  organizationStatus?: string; // Organization status for conditional validation
};

export type OrganizationEditFormData = {
  step1: OrganizationEditStep1Data;
  step2: OrganizationEditStep2Data;
};

// Form values types
export type Step1FormValues = {
  orgName: string;
  orgFiscalCode: string;
  orgEmail: string;
  orgLogo: File | null;
};

export type Step2FormValues = {
  // Accounting Information
  iban: string;
  ibanPostal: string;
  cbill: string;
  flagTreasury: boolean;
  // Payments Information
  segregationCode: string;
  generateNoticeApiKey: string;
  additionalLanguage: boolean;
  selectedLanguage: string;
  flagNotifyOutcomePush: boolean | null;
  flagPaymentNotification: boolean | null;
  // PagoPA Products Integration
  flagNotifyIo: boolean;
  ioApiKey: string;
  pdndEnabled: boolean;
  sendApiKey: string;
};

// Type for the final payload of the organization update API
export type OrganizationUpdatePayload = {
  organizationId: number;
  flagTreasury: boolean;
  externalOrganizationId: string;
  ipaCode: string;
  orgFiscalCode: string;
  orgName: string;
  orgTypeCode: string;
  orgEmail: string;
  postalIban: string;
  iban: string;
  password: string;
  segregationCode: string;
  cbillInterBankCode: string;
  orgLogo: string;
  status: 'ACTIVE' | 'INACTIVE';
  additionalLanguage: string;
  startDate: string;
  brokerId: number;
  ioApiKey: string;
  sendApiKey: string;
  generateNoticeApiKey: string;
  flagNotifyIo: boolean;
  flagNotifyOutcomePush: boolean;
  flagPaymentNotification: boolean;
  pdndEnabled: boolean;
};

/**
 * Unified form data type - combines step1 and step2 into a single structure
 * Used for the unified form (no wizard steps)
 */
export type UnifiedFormData = {
  // Step 1 fields (Entity Profile)
  orgName: FieldData<string>;
  orgFiscalCode: FieldData<string>;
  orgEmail: FieldData<string>;
  orgLogo: FieldData<string | null>;
  logoRemoved: boolean; // Flag to track if user explicitly removed the logo
  // Step 2 fields (Accounting Information)
  iban: FieldData<string>;
  ibanPostal: FieldData<string>;
  cbill: FieldData<string>;
  flagTreasury: FieldData<boolean>;
  // Step 2 fields (Payments Information)
  segregationCode: FieldData<string>;
  generateNoticeApiKey: FieldData<string>;
  additionalLanguage: FieldData<boolean>;
  selectedLanguage: FieldData<string>;
  flagNotifyOutcomePush: FieldData<boolean | null>;
  flagPaymentNotification: FieldData<boolean | null>;
  // Step 2 fields (PagoPA Products Integration)
  flagNotifyIo: FieldData<boolean>;
  ioApiKey: FieldData<string>;
  pdndEnabled: FieldData<boolean>;
  sendApiKey: FieldData<string>;
  // Common field
  organizationStatus?: string; // Organization status for conditional validation
};

/**
 * Unified form values type - combines Step1FormValues and Step2FormValues
 * Used for react-hook-form values in the unified form
 */
export type UnifiedFormValues = {
  // Step 1 fields (Entity Profile)
  orgName: string;
  orgFiscalCode: string;
  orgEmail: string;
  orgLogo: File | null;
  // Step 2 fields (Accounting Information)
  iban: string;
  ibanPostal: string;
  cbill: string;
  flagTreasury: boolean;
  // Step 2 fields (Payments Information)
  segregationCode: string;
  generateNoticeApiKey: string;
  additionalLanguage: boolean;
  selectedLanguage: string;
  flagNotifyOutcomePush: boolean | null;
  flagPaymentNotification: boolean | null;
  // Step 2 fields (PagoPA Products Integration)
  flagNotifyIo: boolean;
  ioApiKey: string;
  pdndEnabled: boolean;
  sendApiKey: string;
};
