import { z } from 'zod';
import { AssessmentsRegistryStatus } from '../../../../../generated/core/data-contracts';

export type AssessmentRegistryFormValues = {
  debtPositionType: string;
  status: AssessmentsRegistryStatus;
  operatingYear: { from: Date; to: null };
  sectionCode: string;
  sectionDescription: string;
  officeCode: string;
  officeDescription: string;
  assessmentCode: string;
  assessmentDescription: string;
};

export const assessmentRegistrySchema = z.object({
  debtPositionType: z.string().min(1, { message: 'Required' }),
  status: z.nativeEnum(AssessmentsRegistryStatus),
  operatingYear: z.object({
    from: z.date(),
    to: z.null()
  }),
  sectionCode: z.string().min(1, { message: 'Required' }),
  sectionDescription: z.string(),
  officeCode: z.string(),
  officeDescription: z.string(),
  assessmentCode: z.string(),
  assessmentDescription: z.string()
});
