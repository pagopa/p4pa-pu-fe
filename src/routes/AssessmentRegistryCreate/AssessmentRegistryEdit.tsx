import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { PageRoutes } from '../../routes';
import { Step1Configuration } from './steps/Step1Configuration';
import WizardStepButtons from '../../components/Wizard/WizardStepButtons';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  AssessmentRegistryFormValues,
  assessmentRegistrySchema
} from './steps/Step1Configuration/schema';
import { AssessmentsRegistry } from '../../../generated/data-contracts';
import {
  getAssessmentsRegistry,
  updateAssessmentsRegistry
} from '../../api/assessments';
import { useStore } from '../../store/GlobalStore';
import { useEffect, useState } from 'react';
import TitleComponent from '../../components/TitleComponent/TitleComponent';

export const AssessmentRegistryEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [init, setInit] = useState(false);
  const {
    state: { organizationId }
  } = useStore();
  const { assessmentRegistryId } = useParams<{
    assessmentRegistryId: string;
  }>();

  if (!assessmentRegistryId || isNaN(Number(assessmentRegistryId))) {
    navigate(PageRoutes.RESPONSES_ERROR);
  }

  const { data: existingRegistry } = getAssessmentsRegistry(
    organizationId,
    Number(assessmentRegistryId)
  );

  const update = updateAssessmentsRegistry(
    organizationId,
    Number(assessmentRegistryId)
  );

  const methods = useForm<AssessmentRegistryFormValues>({
    resolver: zodResolver(assessmentRegistrySchema)
  });

  // Pre-fill form when data loads or changes
  useEffect(() => {
    if (existingRegistry) {
      const initValues: AssessmentRegistryFormValues = {
        debtPositionType: existingRegistry.debtPositionTypeOrgCode ?? '',
        status: existingRegistry.status,
        operatingYear: {
          from: new Date(Number(existingRegistry.operatingYear), 0, 1),
          to: null
        },
        sectionCode: existingRegistry.sectionCode ?? '',
        sectionDescription: existingRegistry.sectionDescription ?? '',
        officeCode: existingRegistry.officeCode ?? '',
        officeDescription: existingRegistry.officeDescription ?? '',
        assessmentCode: existingRegistry.assessmentCode ?? '',
        assessmentDescription: existingRegistry.assessmentDescription ?? ''
      };
      methods.reset(initValues);
      setInit(true);
    }
  }, [existingRegistry, methods]);

  const submit = async (data: z.infer<typeof assessmentRegistrySchema>) => {
    try {
      const request: AssessmentsRegistry = {
        ...data,
        organizationId,
        assessmentRegistryId: Number(assessmentRegistryId),
        debtPositionTypeOrgCode: data.debtPositionType,
        operatingYear: data.operatingYear.from.getFullYear().toString()
      };
      await update.mutateAsync(request);
      navigate(PageRoutes.RESPONSES_SUCCESS, {
        replace: true,
        state: {
          category: 'assessment-registry-update',
          assessmentRegistryId: Number(assessmentRegistryId),
          i18nParams: {
            paymentObject: request?.sectionDescription || request?.sectionCode
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
        accessibleTitle={t('AssessmentRegistryUpdate.accessibleTitle')}
      />
      <form
        aria-label={t('assessmentRegistry.formLabelEdit')}
        role="form"
        noValidate
        onSubmit={methods.handleSubmit(submit)}
      >
        {init && <Step1Configuration edit key="step1" />}

        <WizardStepButtons
          nextLabel={t('commons.save')}
          onBack={() => navigate(-1)}
          onNext={methods.handleSubmit(submit)}
        />
      </form>
    </FormProvider>
  );
};
