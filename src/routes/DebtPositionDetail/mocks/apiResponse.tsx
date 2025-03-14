import { DebtPositionDetailDTO } from '../../../../generated/apiClient';

// request params: organizationId=3, debtPositionId=10
export const mockData: DebtPositionDetailDTO = {
  debtor: {
    entityType: 'F',
    fiscalCode: 'ABCDEF12G34H567I',
    fullName: 'Mario Rossi',
    address: 'Via Roma',
    civic: '10',
    postalCode: '00100',
    location: 'Roma',
    province: 'RM',
    nation: 'IT',
    email: 'mario.rossi@example.com'
  },
  debtPositionTypeOrgDescription: 'Test for Create Debt Position',
  debtPositionTypeOrgCode: 'CODE001',
  iupd: 'ORGTEST',
  status: 'REPORTED',
  paymentOptions: [
    {
      paymentOptionId: 10,
      debtPositionId: 10,
      totalAmountCents: 5400,
      status: 'REPORTED',
      dueDate: '2026-01-01',
      description: 'happycaseclasification',
      paymentOptionType: 'INSTALLMENTS',
      paymentOptionIndex: 1,
      installments: [
        {
          installmentId: 1,
          paymentOptionId: 10,
          status: 'UNPAID',
          syncStatus: {
            syncStatusFrom: 'PAID',
            syncStatusTo: 'PAID'
          },
          iupdPagopa: 'iupdPagopaClassification',
          iud: 'iud',
          iuv: 'RF05013300000022785700001',
          iur: '00078579120595392415_1',
          nav: '3RF05013300000022785700000',
          dueDate: '2026-05-15',
          paymentTypeCode: 'paymentTypeCode',
          amountCents: 54,
          remittanceInformation: 'remittanceInformation',
          balance: 'balance',
          legacyPaymentMetadata: 'legacyPaymentMetadata',
          debtor: {
            entityType: 'F',
            fiscalCode: 'ABCDEF12G34H567I',
            fullName: 'Mario Rossi',
            address: 'Via Roma',
            civic: '10',
            postalCode: '00100',
            location: 'Roma',
            province: 'RM',
            nation: 'IT',
            email: 'mario.rossi@example.com'
          },
          transfers: [
            {
              transferId: 37,
              installmentId: 1,
              orgFiscalCode: '99999999990',
              orgName: 'Ente P4PA intermediato 1',
              amountCents: 1234,
              remittanceInformation: 'test',
              stampType: '',
              stampHashDocument: '',
              stampProvincialResidence: '',
              iban: 'iban',
              postalIban: '',
              category: 'test',
              transferIndex: 1
            }
          ],
          creationDate: '2025-02-08T00:21:41.469036',
          updateDate: '2025-02-18T17:23:52.225872'
        },
        {
          installmentId: 10,
          paymentOptionId: 10,
          status: 'REPORTED',
          syncStatus: {
            syncStatusFrom: 'PAID',
            syncStatusTo: 'PAID'
          },
          iupdPagopa: 'iupdPagopaClassification',
          iud: 'iud',
          iuv: 'RF05013300000022785700000',
          iur: '00078579120595392415_1',
          nav: '3RF05013300000022785700000',
          dueDate: '2026-05-15',
          paymentTypeCode: 'paymentTypeCode',
          amountCents: 5400,
          remittanceInformation: 'remittanceInformation',
          balance: 'balance',
          legacyPaymentMetadata: 'legacyPaymentMetadata',
          debtor: {
            entityType: 'F',
            fiscalCode: 'ABCDEF12G34H567I',
            fullName: 'Mario Rossi',
            address: 'Via Roma',
            civic: '10',
            postalCode: '00100',
            location: 'Roma',
            province: 'RM',
            nation: 'IT',
            email: 'mario.rossi@example.com'
          },
          transfers: [
            {
              transferId: 10,
              installmentId: 10,
              orgFiscalCode: '99999999982',
              orgName: 'test_happy_case_classification',
              amountCents: 5400,
              remittanceInformation: 'remittanceInformation',
              stampType: 'stampType',
              stampHashDocument: 'stampHashDocument',
              stampProvincialResidence: 'stampProvincialResidence',
              iban: 'iban',
              postalIban: 'postalIban',
              category: 'category',
              transferIndex: 1
            }
          ],
          creationDate: '2025-02-08T00:21:41.469036',
          updateDate: '2025-02-25T14:48:06.463205'
        }
      ]
    },
    {
      paymentOptionId: 318,
      debtPositionId: 10,
      totalAmountCents: 5400,
      status: 'REPORTED',
      dueDate: '2026-01-01',
      description: 'happycaseclasification',
      paymentOptionType: 'SINGLE_INSTALLMENT',
      paymentOptionIndex: 2,
      installments: [
        {
          installmentId: 305,
          paymentOptionId: 318,
          status: 'UNPAID',
          syncStatus: {
            syncStatusFrom: 'PAID',
            syncStatusTo: 'PAID'
          },
          iupdPagopa: 'iupdPagopaClassification',
          iud: 'iud',
          iuv: 'RF05013300000022785700001',
          iur: '00078579120595392415_1',
          nav: '3RF05013300000022785700000',
          dueDate: '2026-05-15',
          paymentTypeCode: 'paymentTypeCode',
          amountCents: 54,
          remittanceInformation: 'remittanceInformation',
          balance: 'balance',
          legacyPaymentMetadata: 'legacyPaymentMetadata',
          debtor: {
            entityType: 'F',
            fiscalCode: 'ABCDEF12G34H567I',
            fullName: 'Mario Rossi',
            address: 'Via Roma',
            civic: '10',
            postalCode: '00100',
            location: 'Roma',
            province: 'RM',
            nation: 'IT',
            email: 'mario.rossi@example.com'
          },
          transfers: [],
          creationDate: '2025-02-08T00:21:41.469036',
          updateDate: '2025-02-18T17:23:52.225872'
        }
      ]
    },
    {
      paymentOptionId: 334,
      debtPositionId: 10,
      totalAmountCents: 5400,
      status: 'REPORTED',
      dueDate: '2026-01-01',
      description: 'happycaseclasification',
      paymentOptionType: 'DOWN_PAYMENT',
      paymentOptionIndex: 3,
      installments: [
        {
          installmentId: 321,
          paymentOptionId: 334,
          status: 'TO_SYNC',
          syncStatus: {
            syncStatusFrom: 'DRAFT',
            syncStatusTo: 'UNPAID'
          },
          iupdPagopa: '99999999982_dbe8095df3004e168e91006ff2d1ff16',
          iud: '000a7e54588d3734e6cab95a2b3db20e084',
          iuv: '01000000000009940',
          iur: 'iur',
          iuf: 'iuf',
          nav: '301000000000009940',
          dueDate: '2025-03-20',
          paymentTypeCode: 'paymentTypeCode',
          amountCents: 10000,
          remittanceInformation: 'Tassa da pagare',
          balance: 'balance',
          debtor: {
            entityType: 'F',
            fiscalCode: 'PSTRRT80M20B157M',
            fullName: 'Roberto Pasetti',
            address: 'via San Gaetanino',
            civic: '34',
            postalCode: '25123',
            location: 'Brescia',
            province: 'BS',
            nation: 'IT',
            email: 'roberto.pasetti@pagopa.it'
          },
          transfers: [],
          notificationDate: '2024-02-17T09:30',
          ingestionFlowFileId: 1,
          ingestionFlowFileLineNumber: 1,
          creationDate: '2025-03-11T17:34:14.126845',
          updateDate: '2025-03-11T17:34:14.126845'
        }
      ]
    }
  ]
};
