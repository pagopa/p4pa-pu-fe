// TypeScript models for Organization Edit Wizard following project patterns

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
  // TODO: Define the fields of step2 when necessary
  // Placeholder for future fields of organization configuration
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
