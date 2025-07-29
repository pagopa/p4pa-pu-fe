import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useNavigate,
  useLocation,
  generatePath,
  useSearchParams
} from 'react-router';
import { FormProvider, useWatch } from 'react-hook-form';
import { Typography, Box } from '@mui/material';
import { Stepper } from '../../components/Stepper/types';
import { StepperContainer } from '../../components/Stepper';
import WizardStepButtons from '../../components/Wizard/WizardStepButtons';
import { PageRoutes } from '../../routes';
import { useStore } from '../../store/GlobalStore';
import { createAssessment } from '../../api/assessments';
import { useStepperLogic } from '../../hooks/useStepperLogic';
import utils from '../../utils';
import { Step1Configuration } from './components/Step1Configuration';
import {
  Step2Payments,
  validateStep2Payments,
  Step2PaymentsRef
} from './components/Step2Payments';
import { Step3AssignChapter } from './components/Step3AssignChapter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';

const assessmentFormSchema = z.object({
  assessmentName: z
    .string({
      required_error:
        'assessmentCreate.configuration.step1.fields.name.required'
    })
    .min(1, 'assessmentCreate.configuration.step1.fields.name.required'),
  debtPositionTypeOrgCode: z
    .string({
      required_error:
        'assessmentCreate.configuration.step1.fields.debtPositionType.required'
    })
    .min(
      1,
      'assessmentCreate.configuration.step1.fields.debtPositionType.required'
    )
});

const step3Schema = z.object({
  operatingYear: z
    .string({
      required_error:
        'assessmentCreate.configuration.step3.fields.operatingYear.required'
    })
    .min(
      1,
      'assessmentCreate.configuration.step3.fields.operatingYear.required'
    ),
  chapterCode: z
    .string({
      required_error:
        'assessmentCreate.configuration.step3.fields.chapter.required'
    })
    .min(1, 'assessmentCreate.configuration.step3.fields.chapter.required')
});

type AssessmentFormData = z.infer<typeof assessmentFormSchema> & {
  addPaymentsToAssessment?: boolean;
  selectedPayments?: Array<string>;
  selectedPaymentIuds?: Array<string>;
  operatingYear?: string;
  chapterCode?: string;
  assessmentRegistryId?: number;
  isModifyMode?: boolean;
  modifyAction?: 'add' | 'remove';
  assessmentId?: number;
};

type AssessmentDetailNavigationState = {
  mode: 'add' | 'remove';
  assessmentId: number;
  assessmentName: string;
  debtPositionTypeOrgCode: string;
  fromAssessmentDetail: boolean;
};

export const AssessmentCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const {
    state: { organizationId }
  } = useStore();

  const getNavigationState = (): AssessmentDetailNavigationState | null => {
    const locationState =
      location.state as AssessmentDetailNavigationState | null;
    if (locationState?.fromAssessmentDetail) {
      return locationState;
    }

    // Fallback: read from URL params
    const urlMode = searchParams.get('mode') as 'add' | 'remove' | null;
    const urlAssessmentId = searchParams.get('assessmentId');
    const urlFrom = searchParams.get('from');
    const urlDebtPositionTypeOrgCode = searchParams.get(
      'debtPositionTypeOrgCode'
    );
    const urlAssessmentName = searchParams.get('assessmentName');

    if (urlMode && urlAssessmentId && urlFrom === 'detail') {
      return {
        mode: urlMode,
        assessmentId: parseInt(urlAssessmentId),
        assessmentName: urlAssessmentName || '',
        debtPositionTypeOrgCode: urlDebtPositionTypeOrgCode || '',
        fromAssessmentDetail: true
      };
    }

    return null;
  };

  // Save the initial navigation state in a useRef to preserve it between re-renders
  const initialNavigationState = useRef<AssessmentDetailNavigationState | null>(
    getNavigationState()
  );

  // Always use the initial state, ignoring subsequent changes
  const isModifyMode =
    initialNavigationState.current?.fromAssessmentDetail === true;
  const modifyAction = initialNavigationState.current?.mode;

  const methods = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentFormSchema),
    mode: 'onTouched',
    defaultValues: {
      assessmentName: initialNavigationState.current?.assessmentName || '',
      debtPositionTypeOrgCode:
        initialNavigationState.current?.debtPositionTypeOrgCode || '',
      addPaymentsToAssessment: isModifyMode ? true : false,
      selectedPayments: [],
      selectedPaymentIuds: [],
      operatingYear: '',
      chapterCode: '',
      assessmentRegistryId: undefined,
      isModifyMode: isModifyMode,
      modifyAction: modifyAction,
      assessmentId: initialNavigationState.current?.assessmentId
    }
  });

  const addPaymentsToAssessmentRaw = useWatch({
    control: methods.control,
    name: 'addPaymentsToAssessment'
  });

  const addPaymentsToAssessment = Boolean(
    addPaymentsToAssessmentRaw === true ||
      (typeof addPaymentsToAssessmentRaw === 'string' &&
        addPaymentsToAssessmentRaw === 'true')
  );

  // In modify mode: Remove = 1 step (no wizard), Add = 2 steps
  // In normal mode: 2 steps if no payments, 3 steps if payments
  const totalSteps = useMemo(() => {
    if (isModifyMode) {
      // Remove mode: no wizard, only Step2Payment
      if (modifyAction === 'remove') {
        return 1;
      }
      // Add mode: 2 steps (Step2 + Step3)
      return 2;
    }
    return addPaymentsToAssessment ? 3 : 2;
  }, [isModifyMode, addPaymentsToAssessment, modifyAction]);

  const {
    currentStep,
    goToNextStep,
    goToPreviousStep,
    isFirstStep,
    isLastStep
  } = useStepperLogic({ initialStep: 0, totalSteps });

  const createAssessmentMutation = createAssessment(organizationId);

  const { getValues, clearErrors, trigger, setError } = methods;

  const step2PaymentsRef = useRef<Step2PaymentsRef>(null);

  const getAssessmentRegistryIdFromChapter = async (
    values: AssessmentFormData
  ): Promise<number | undefined> => {
    return values.assessmentRegistryId;
  };

  const validateStep = (step: number, values: AssessmentFormData) => {
    // In modify mode: Remove = Step 0 only, Add = Step 0 (payments) + Step 1 (chapters)
    if (isModifyMode) {
      if (modifyAction === 'remove') {
        // Remove mode: only Step 0 (payments)
        if (step === 0) {
          return {
            isValid: validateStep2Payments(values),
            fields: [] as const
          };
        }
        return { isValid: false, fields: [] as const };
      } else {
        // Add mode: Step 0 = payments, Step 1 = chapters
        if (step === 0) {
          return {
            isValid: validateStep2Payments(values),
            fields: [] as const
          };
        }
        if (step === 1) {
          const yearValid = !!values.operatingYear;
          const chapterValid = !values.operatingYear || !!values.chapterCode;
          return {
            isValid: yearValid && chapterValid,
            fields: ['operatingYear', 'chapterCode'] as const
          };
        }
        return { isValid: false, fields: [] as const };
      }
    }

    // Normal flow creation
    if (step === 0) {
      return {
        isValid: !!values.assessmentName && !!values.debtPositionTypeOrgCode,
        fields: ['assessmentName', 'debtPositionTypeOrgCode'] as const
      };
    }
    if (step === 1) {
      return {
        isValid: validateStep2Payments(values),
        fields: [] as const
      };
    }
    if (step === 2) {
      if (addPaymentsToAssessment) {
        // Year is always required, Chapter is required only if Year is selected
        const yearValid = !!values.operatingYear;
        const chapterValid = !values.operatingYear || !!values.chapterCode;

        return {
          isValid: yearValid && chapterValid,
          fields: ['operatingYear', 'chapterCode'] as const
        };
      }
      return {
        isValid: true,
        fields: [] as const
      };
    }
    return { isValid: false, fields: [] as const };
  };

  const handleSubmit = async (values: AssessmentFormData) => {
    // Handle Remove mode
    if (isModifyMode && modifyAction === 'remove') {
      console.log(
        'Remove action triggered with selected payments:',
        values.selectedPaymentIuds
      );
      // TODO: Implement remove API call
      return;
    }

    try {
      // STEP 1: Create always the standard assessment
      const response = await createAssessmentMutation.mutateAsync({
        assessmentName: values.assessmentName,
        debtPositionTypeOrgCode: values.debtPositionTypeOrgCode
      });
      const assessmentId = response.assessmentId;
      if (!assessmentId) {
        throw new Error('Assessment ID not received from the response');
      }
      // STEP 2: If there are selected payments, create also assessment-details
      if (
        addPaymentsToAssessment &&
        values.selectedPaymentIuds &&
        values.selectedPaymentIuds.length > 0
      ) {
        const assessmentRegistryId =
          await getAssessmentRegistryIdFromChapter(values);

        if (!assessmentRegistryId) {
          throw new Error(
            'Assessment Registry ID not found for the selected chapter'
          );
        }

        await utils.apiClient.bff.createAssessmentsDetail(
          organizationId,
          assessmentId,
          {
            assessmentRegistryId,
            iuds: values.selectedPaymentIuds
          }
        );
      }

      // STEP 3: Final navigation
      navigate(PageRoutes.RESPONSES_SUCCESS, {
        replace: true,
        state: {
          category: 'assessment-create',
          i18nParams: {
            assessmentName: response.assessmentName
          },
          assessmentId: response.assessmentId
        }
      });
    } catch (error) {
      console.error('Error during creation:', error);

      if (error instanceof AxiosError && error.response?.status === 409) {
        utils.notify.emit(t('assessmentCreate.error.nameAlreadyPresent'));
        return;
      }

      navigate(PageRoutes.RESPONSES_ERROR, {
        replace: true,
        state: {
          errorType: 'default'
        }
      });
    }
  };

  // Funzione helper per gestire la validazione degli errori del capitolo
  const handleChapterValidationErrors = useCallback(
    (values: AssessmentFormData) => {
      const fieldsToValidate: Array<'operatingYear' | 'chapterCode'> = [
        'operatingYear'
      ];
      if (values.operatingYear) {
        fieldsToValidate.push('chapterCode');
      }

      try {
        step3Schema.parse({
          operatingYear: values.operatingYear,
          chapterCode: values.chapterCode
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            const fieldName = err.path[0] as 'operatingYear' | 'chapterCode';
            if (fieldsToValidate.includes(fieldName)) {
              setError(fieldName, {
                type: 'manual',
                message: t(err.message)
              });
            }
          });
        }
      }
    },
    [setError, t]
  );

  const handleValidationErrors = useCallback(
    async (
      values: AssessmentFormData,
      fields: ReadonlyArray<keyof AssessmentFormData>
    ) => {
      const isChapterStep = isModifyMode
        ? currentStep === 1
        : currentStep === 2;
      const isPaymentStep = isModifyMode
        ? currentStep === 0
        : currentStep === 1;

      if (isChapterStep && (isModifyMode || addPaymentsToAssessment)) {
        handleChapterValidationErrors(values);
      } else if (isPaymentStep) {
        if (step2PaymentsRef.current) {
          step2PaymentsRef.current.showValidationError(true);
        }
      } else {
        await trigger(fields);
      }
    },
    [
      isModifyMode,
      currentStep,
      addPaymentsToAssessment,
      handleChapterValidationErrors,
      trigger
    ]
  );

  const handleConditionalNavigation = useCallback(
    async (values: AssessmentFormData) => {
      // LOGIC CONDITIONAL STEP - Point of bifurcation only in normal mode
      if (!isModifyMode && currentStep === 1) {
        if (addPaymentsToAssessment) {
          goToNextStep();
        } else {
          await handleSubmit(values);
        }
        return;
      }

      // LOGIC CONDITIONAL STEP 2 - Point of bifurcation of the flow
      if (currentStep === 1) {
        if (addPaymentsToAssessment) {
          goToNextStep();
        } else {
          await handleSubmit(values);
        }
        return;
      }

      if (isLastStep) {
        await handleSubmit(values);
      } else {
        goToNextStep();
      }
    },
    [
      isModifyMode,
      currentStep,
      addPaymentsToAssessment,
      goToNextStep,
      handleSubmit,
      isLastStep
    ]
  );

  // Conditional navigation logic for the wizard
  const handleNext = useCallback(async () => {
    try {
      clearErrors();
      const values = getValues();

      const { isValid, fields } = validateStep(currentStep, values);

      if (!isValid) {
        await handleValidationErrors(values, fields);
        return;
      }

      await handleConditionalNavigation(values);
    } catch (e) {
      console.error('Error in handleNext:', e);
      utils.notify.emit(t('errors.generic'));
    }
  }, [
    clearErrors,
    getValues,
    currentStep,
    handleValidationErrors,
    handleConditionalNavigation,
    t
  ]);

  const handleBack = () => {
    if (isFirstStep) {
      if (isModifyMode && initialNavigationState.current?.assessmentId) {
        navigate(
          generatePath(PageRoutes.ASSESSMENT_DETAIL, {
            id: initialNavigationState.current.assessmentId.toString()
          })
        );
      } else {
        navigate(PageRoutes.ASSESSMENT_INDEX);
      }
    } else {
      goToPreviousStep();
    }
  };

  const getNextButtonLabel = () => {
    if (isModifyMode) {
      if (modifyAction === 'remove') {
        // Remove mode: always show "Rimuovi" since it's only 1 step
        return t('commons.remove');
      } else {
        // Add mode: step 0 = payments, step 1 = chapters (last)
        if (currentStep === 1) {
          return t('commons.add');
        }
        return t('commons.continue');
      }
    }

    // Normal flow
    if (currentStep === 1) {
      return addPaymentsToAssessment
        ? t('commons.continue')
        : t('commons.create');
    }
    return isLastStep ? t('commons.create') : t('commons.continue');
  };

  const step1Component = useMemo(() => <Step1Configuration />, []);
  const step2Component = useMemo(
    () => (
      <Step2Payments
        ref={step2PaymentsRef}
        isActive={isModifyMode ? currentStep === 0 : currentStep === 1}
      />
    ),
    [currentStep, isModifyMode]
  );
  const step3Component = useMemo(() => <Step3AssignChapter />, []);

  const steps: Stepper['steps'] = useMemo(() => {
    // In modify mode
    if (isModifyMode) {
      if (modifyAction === 'remove') {
        // Remove mode: no wizard, only Step2Payment content
        return [
          {
            label: t('assessmentCreate.stepper.step2'),
            content: step2Component
          }
        ];
      } else {
        // Add mode: Step2 becomes Step1, Step3 becomes Step2
        return [
          {
            label: t('assessmentCreate.stepper.step2'),
            content: step2Component
          },
          {
            label: t('assessmentCreate.stepper.step3'),
            content: step3Component
          }
        ];
      }
    }

    // Normal flow creation
    const baseSteps = [
      {
        label: t('assessmentCreate.stepper.step1'),
        content: step1Component
      },
      {
        label: t('assessmentCreate.stepper.step2'),
        optional: true,
        content: step2Component
      }
    ];

    if (addPaymentsToAssessment) {
      baseSteps.push({
        label: t('assessmentCreate.stepper.step3'),
        content: step3Component
      });
    }

    return baseSteps;
  }, [
    t,
    isModifyMode,
    modifyAction,
    addPaymentsToAssessment,
    step1Component,
    step2Component,
    step3Component
  ]);

  const getTitle = () => {
    if (isModifyMode) {
      return modifyAction === 'add'
        ? t('assessmentCreate.modify.addPayments.title')
        : t('assessmentCreate.modify.removePayments.title');
    }
    return t('assessmentCreate.title');
  };

  const getDescription = () => {
    if (isModifyMode) {
      return modifyAction === 'add'
        ? t('assessmentCreate.modify.addPayments.description')
        : t('assessmentCreate.modify.removePayments.description');
    }
    return t('assessmentCreate.description');
  };

  return (
    <FormProvider {...methods}>
      <form aria-label={t('assessmentCreate.formLabel')} role="form" noValidate>
        {isModifyMode && modifyAction === 'remove' ? (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {getTitle()}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {getDescription()}
              </Typography>
            </Box>
            {step2Component}
          </>
        ) : (
          <StepperContainer
            title={getTitle()}
            description={getDescription()}
            steps={steps}
            activeStep={currentStep}
          />
        )}

        <WizardStepButtons
          onBack={handleBack}
          onNext={handleNext}
          nextLabel={getNextButtonLabel()}
        />
      </form>
    </FormProvider>
  );
};
