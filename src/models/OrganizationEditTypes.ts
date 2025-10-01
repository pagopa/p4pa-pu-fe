// TypeScript models for Organization Edit Wizard following project patterns

// Language options for additional language select
export const LANGUAGE_OPTIONS = {
  EN: 'en',
  FR: 'fr',
  DE: 'de'
} as const;

export type LanguageCode = typeof LANGUAGE_OPTIONS[keyof typeof LANGUAGE_OPTIONS];

export type FieldData<T> = {
  value: T;
  readonly: boolean;
};

export type OrganizationEditStep1Data = {
  orgName: FieldData<string>;
  orgFiscalCode: FieldData<string>;
  orgEmail: FieldData<string>;
  orgLogo: FieldData<string | null>;
};

export type OrganizationEditStep2Data = {
  // Accounting Information
  iban: FieldData<string>;
  ibanContabile: FieldData<string>;
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
};

export type OrganizationEditFormData = {
  step1: OrganizationEditStep1Data;
  step2: OrganizationEditStep2Data;
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
