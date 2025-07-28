import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import { Stack, Alert } from '@mui/material';
import SectionBox from '../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../components/FormComponent';
import { useOperatingYears } from '../../../hooks/useOperatingYears';
import { useChapters } from '../../../hooks/useChapters';

type AssessmentFormData = {
  addPaymentsToAssessment?: boolean;
  selectedPayments?: Array<string>;
  selectedPaymentIuds?: Array<string>;
  operatingYear?: string;
  chapterCode?: string;
  debtPositionTypeOrgCode?: string;
  assessmentRegistryId?: number;
};

export const Step3AssignChapter = () => {
  const { t } = useTranslation();
  const { control, setValue, clearErrors } =
    useFormContext<AssessmentFormData>();

  // Access pre-loaded operating years data from React Query cache
  // Data was loaded in Step 2 when user selected "Sì", so we access cache without making new API calls
  const { optionsMap: yearOptions, isLoading: isLoadingYears } =
    useOperatingYears({
      includeAllOption: false,
      enabled: false // Don't make new API calls - just access cached data
    });

  const selectedYear = useWatch({
    control,
    name: 'operatingYear'
  });

  const debtPositionTypeOrgCode = useWatch({
    control,
    name: 'debtPositionTypeOrgCode'
  });

  // This uses 'selection' purpose to have separate cache from Step2 validation
  // NOTE: The chapters select is populated ONLY after an operating year is selected
  const chaptersQuery = useChapters({
    operatingYear: selectedYear || '',
    debtPositionTypeOrgCode: debtPositionTypeOrgCode || '',
    enabled: !!selectedYear && !!debtPositionTypeOrgCode,
    purpose: 'selection' // Step3 uses 'selection' purpose for cache differentiation
  });

  const {
    optionsMap: chapterOptions = [],
    isLoading: isLoadingChapters,
    hasNoResults,
    getAssessmentRegistryId
  } = chaptersQuery;

  const selectedChapterCode = useWatch({
    control,
    name: 'chapterCode'
  });

  const assessmentRegistryId = selectedChapterCode
    ? getAssessmentRegistryId(selectedChapterCode)
    : undefined;

  const getOperatingYearPlaceholder = () => {
    if (isLoadingYears) {
      return t('commons.loading');
    }
    if (!yearOptions?.length) {
      return t(
        'assessmentCreate.configuration.step3.fields.operatingYear.noData'
      );
    }
    return t(
      'assessmentCreate.configuration.step3.fields.operatingYear.placeholder'
    );
  };

  const getChapterPlaceholder = () => {
    if (isLoadingChapters) {
      return t('commons.loading');
    }
    if (!selectedYear) {
      return t(
        'assessmentCreate.configuration.step3.fields.chapter.selectYearFirst'
      );
    }
    if (hasNoResults) {
      return t('assessmentCreate.configuration.step3.fields.chapter.noData');
    }
    return t('assessmentCreate.configuration.step3.fields.chapter.placeholder');
  };

  useEffect(() => {
    if (selectedChapterCode && assessmentRegistryId) {
      setValue('assessmentRegistryId', assessmentRegistryId);
    }
  }, [selectedChapterCode, assessmentRegistryId, setValue]);

  useEffect(() => {
    setValue('chapterCode', '');
    setValue('assessmentRegistryId', undefined);
    clearErrors(['operatingYear', 'chapterCode']);
  }, [selectedYear, setValue, clearErrors]);

  return (
    <WizardStepWrapper title={t('assessmentCreate.configuration.step3.title')}>
      <SectionBox
        data-testid="step3-assign-chapter"
        title={t('assessmentCreate.configuration.step3.fields.chapter.label')}
        adornment={<BookmarksIcon />}
      >
        <Stack direction="column" spacing={2}>
          {selectedYear && hasNoResults && !isLoadingChapters && (
            <Alert
              severity="warning"
              variant="outlined"
              data-testid="no-chapters-warning-banner"
            >
              {t('errors.noChaptersForYear', { year: selectedYear })}
            </Alert>
          )}

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            alignItems="flex-start"
          >
            <Stack flex={1}>
              <FormComponent.ControlledSelect
                name="operatingYear"
                control={control}
                label={t(
                  'assessmentCreate.configuration.step3.fields.operatingYear.label'
                )}
                data-testid="operatingYear"
                placeholder={getOperatingYearPlaceholder()}
                disabled={isLoadingYears || !yearOptions?.length}
                options={yearOptions}
                required
              />
            </Stack>

            <Stack flex={1}>
              <FormComponent.ControlledSelect
                name="chapterCode"
                control={control}
                label={t(
                  'assessmentCreate.configuration.step3.fields.chapter.label'
                )}
                data-testid="chapterCode"
                placeholder={getChapterPlaceholder()}
                disabled={!selectedYear || isLoadingChapters || hasNoResults}
                options={chapterOptions}
                required
              />
            </Stack>
          </Stack>
        </Stack>
      </SectionBox>
    </WizardStepWrapper>
  );
};
