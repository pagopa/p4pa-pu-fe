import { useForm } from 'react-hook-form';
import { useCallback } from 'react';
import {
  ClassificationsExportFileRequestDTO,
  ClassificationsExportFileFilter,
  ExportFileTypeEnum,
  LabelEnum
} from '../../generated/apiClient';

const isValidLabelEnum = (value: string): value is LabelEnum => {
  return Object.values(LabelEnum).includes(value as LabelEnum);
};

export type ClassificationFormFields = {
  fileVersion: string;
  label: string;
  iuv: string;
  iud: string;
  iuf: string;
  iur: string;
  remittanceInformation: string;
  accountRegistryCode: string;
  billAmountCents: string;
  reportingIur: string;
  pspLastName: string;
  pspCompanyName: string;
  regulationUniqueIdentifier: string;
};

const DEFAULT_VALUES: ClassificationFormFields = {
  fileVersion: '',
  label: '',
  iuv: '',
  remittanceInformation: '',
  iur: '',
  iud: '',
  iuf: '',
  reportingIur: '',
  billAmountCents: '',
  accountRegistryCode: '',
  pspLastName: '',
  pspCompanyName: '',
  regulationUniqueIdentifier: ''
};

export const useClassificationExport = (organizationId: number) => {
  const formMethods = useForm<ClassificationFormFields>({
    defaultValues: DEFAULT_VALUES
  });

  const dateToIso = useCallback((date: Date | null): string | undefined => {
    return date ? date.toISOString().split('T')[0] : undefined;
  }, []);

  const validateForm = useCallback(
    (
      formData: ClassificationFormFields,
      dateRanges: Record<string, { from: Date | null; to: Date | null }>
    ): boolean => {
      // fileVersion è sempre obbligatorio
      if (!formData.fileVersion) return false;

      const classificationRange = dateRanges.classification;
      const hasCompleteClassificationRange = !!(
        classificationRange.from && classificationRange.to
      );

      // Controlla se ci sono altri criteri di filtro
      const hasOtherCriteria = !!(
        formData.label ||
        formData.iuv ||
        formData.iur ||
        formData.iud ||
        formData.iuf ||
        formData.remittanceInformation ||
        formData.billAmountCents ||
        formData.accountRegistryCode ||
        formData.pspLastName ||
        formData.pspCompanyName ||
        formData.regulationUniqueIdentifier ||
        formData.reportingIur
      );

      // È valido se ha almeno un range di date completo O altri criteri
      return hasCompleteClassificationRange || hasOtherCriteria;
    },
    []
  );

  const buildApiPayload = useCallback(
    (
      formData: ClassificationFormFields,
      dateRanges: Record<string, { from: Date | null; to: Date | null }>
    ): ClassificationsExportFileRequestDTO => {
      const filterFields: ClassificationsExportFileFilter = {};

      if (formData.iuv) filterFields.iuv = formData.iuv;
      if (formData.iud) filterFields.iud = formData.iud;
      if (formData.iuf) filterFields.iuf = formData.iuf;
      if (formData.iur || formData.reportingIur) {
        filterFields.iur = formData.iur || formData.reportingIur;
      }
      if (formData.label && isValidLabelEnum(formData.label)) {
        filterFields.label = formData.label;
      }
      if (formData.remittanceInformation) {
        filterFields.remittanceInformation = formData.remittanceInformation;
      }
      if (formData.billAmountCents) {
        const amountInEuros = Number(formData.billAmountCents);
        if (!isNaN(amountInEuros)) {
          filterFields.billAmountCents = Math.round(amountInEuros * 100);
        }
      }
      if (formData.accountRegistryCode) {
        filterFields.accountRegistryCode = formData.accountRegistryCode;
      }
      if (formData.pspLastName) {
        filterFields.pspLastName = formData.pspLastName;
      }
      if (formData.pspCompanyName) {
        filterFields.pspCompanyName = formData.pspCompanyName;
      }
      if (formData.regulationUniqueIdentifier) {
        filterFields.regulationUniqueIdentifier =
          formData.regulationUniqueIdentifier;
      }

      const { classification, payment, reporting, accounting, value, payDate } =
        dateRanges;

      if (classification.from && classification.to) {
        filterFields.lastClassificationDate = {
          from: dateToIso(classification.from),
          to: dateToIso(classification.to)
        };
      }

      if (payment.from && payment.to) {
        filterFields.paymentDate = {
          from: dateToIso(payment.from),
          to: dateToIso(payment.to)
        };
      }

      if (reporting.from && reporting.to) {
        filterFields.regulationDate = {
          from: dateToIso(reporting.from),
          to: dateToIso(reporting.to)
        };
      }

      if (accounting.from && accounting.to) {
        filterFields.billDate = {
          from: dateToIso(accounting.from),
          to: dateToIso(accounting.to)
        };
      }

      if (value.from && value.to) {
        filterFields.regionValueDate = {
          from: dateToIso(value.from),
          to: dateToIso(value.to)
        };
      }

      if (payDate?.from && payDate?.to) {
        filterFields.payDate = {
          from: dateToIso(payDate.from),
          to: dateToIso(payDate.to)
        };
      }

      return {
        organizationId,
        exportFileType: ExportFileTypeEnum.CLASSIFICATIONS,
        fileVersion: formData.fileVersion,
        filterFields
      };
    },
    [organizationId, dateToIso]
  );

  return {
    formMethods,
    validateForm,
    buildApiPayload,
    isValidLabelEnum
  };
};
