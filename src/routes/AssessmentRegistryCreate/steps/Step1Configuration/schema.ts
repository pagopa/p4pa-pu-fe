import { z } from 'zod';
import { AssessmentsRegistryStatus } from '../../../../../generated/data-contracts';

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
  sectionDescription: z.string().min(1, { message: 'Required' }),
  officeCode: z.string().min(1, { message: 'Required' }),
  officeDescription: z.string().min(1, { message: 'Required' }),
  assessmentCode: z.string().min(1, { message: 'Required' }),
  assessmentDescription: z.string().min(1, { message: 'Required' })
});
