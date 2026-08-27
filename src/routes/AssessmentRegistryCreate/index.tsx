import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../../routes';
import { Step1Configuration } from './steps/Step1Configuration';
import WizardStepButtons from '../../components/Wizard/WizardStepButtons';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  AssessmentRegistryFormValues,
  assessmentRegistrySchema
} from './steps/Step1Configuration/schema';
import { AssessmentsRegistry } from '../../../generated/core/data-contracts';
import { createAssessmentsRegistry } from '../../api/assessments';
import { useStore } from '../../store/GlobalStore';
import TitleComponent from '../../components/TitleComponent/TitleComponent';

export const AssessmentRegistryCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    state: { organizationId }
  } = useStore();
  const create = createAssessmentsRegistry(organizationId);

  const methods = useForm<AssessmentRegistryFormValues>({
    resolver: zodResolver(assessmentRegistrySchema),
    defaultValues: {
      debtPositionType: '',
      status: undefined,
      operatingYear: { from: undefined, to: null },
      sectionCode: '',
      sectionDescription: '',
      officeCode: '',
      officeDescription: '',
      assessmentCode: '',
      assessmentDescription: ''
    }
  });

  const submit = async (data: z.infer<typeof assessmentRegistrySchema>) => {
    try {
      const request: AssessmentsRegistry = {
        ...data,
        organizationId,
        debtPositionTypeOrgCode: data.debtPositionType,
        operatingYear: data.operatingYear.from.getFullYear().toString()
      };
      const response = await create.mutateAsync(request);
      navigate(PageRoutes.RESPONSES_SUCCESS, {
        replace: true,
        state: {
          category: 'assessment-registry-create',
          assessmentRegistryId: response.assessmentRegistryId,
          i18nParams: {
            paymentObject: response.sectionDescription
          }
        }
      });
    } catch (error) {
      console.error(error);
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  };

  return (
    <FormProvider {...methods}>
      <TitleComponent
        accessibleTitle={t('AssessmentRegistryCreate.accessibleTitle')}
      />
      <form
        aria-label={t('assessmentRegistry.formLabel')}
        role="form"
        noValidate
        onSubmit={methods.handleSubmit(submit)}
      >
        <Step1Configuration key="step1" />

        <WizardStepButtons
          nextLabel={t('commons.create')}
          onBack={() => navigate(-1)}
          onNext={methods.handleSubmit(submit)}
        />
      </form>
    </FormProvider>
  );
};
