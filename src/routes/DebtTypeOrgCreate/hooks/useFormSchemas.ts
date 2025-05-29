import { useMemo } from 'react';
import { step1Schema } from '../steps/Step1Configuration/schema';
import { step2Schema } from '../steps/Step2Behaviour/schema';
import { step3Schema } from '../steps/Step3Accounting/schema';
import { step4Schema } from '../steps/Step4Notifications/schema';
import { step5Schema } from '../steps/Step5Operators/schema';

export const useFormSchemas = () => {
  return useMemo(() => {
    const stepSchemas = [
      step1Schema,
      step2Schema,
      step3Schema,
      step4Schema,
      step5Schema
    ];

    const combinedSchema = step1Schema
      .and(step2Schema)
      .and(step3Schema)
      .and(step4Schema)
      .and(step5Schema);

    return { stepSchemas, combinedSchema };
  }, []);
};
