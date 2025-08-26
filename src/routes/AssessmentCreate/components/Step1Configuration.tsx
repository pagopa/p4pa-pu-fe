import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import BookIcon from '@mui/icons-material/MenuBook';
import { Stack } from '@mui/material';

import SectionBox from '../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../components/FormComponent';
import { useStore } from '../../../store/GlobalStore';
import { useDebtPositionsTypeOrg } from '../../../hooks/useDebtPositionsTypeOrg';

export type Step1Props = {
  editmode?: boolean;
  isLoading?: boolean;
};

export const Step1Configuration = ({
  editmode = false,
  isLoading = false
}: Step1Props) => {
  const { t } = useTranslation();

  const {
    state: { organizationId }
  } = useStore();

  const debtTypesQuery = useDebtPositionsTypeOrg({
    organizationId,
    includeAllOption: false,
    useCodeAsValue: true,
    filterActiveOnly: true
  });

  const { control } = useFormContext();

  return (
    <WizardStepWrapper title={t('assessmentCreate.configuration.title')}>
      <SectionBox
        data-testid="step1-configuration-assessment"
        title={t('assessmentCreate.configuration.step1.title')}
        adornment={<BookIcon />}
      >
        <Stack direction="column" spacing={3}>
          <FormComponent.ControlledTextField
            name="assessmentName"
            control={control}
            label={t('assessmentCreate.configuration.step1.fields.name.label')}
            data-testid="assessmentName"
            placeholder={t(
              'assessmentCreate.configuration.step1.fields.name.placeholder'
            )}
            disabled={editmode || isLoading}
          />

          <FormComponent.ControlledSelect
            control={control}
            label={t(
              'assessmentCreate.configuration.step1.fields.debtPositionType.label'
            )}
            name="debtPositionTypeOrgCode"
            disabled={
              !debtTypesQuery?.optionsMap?.length || editmode || isLoading
            }
            options={debtTypesQuery?.optionsMap || []}
            data-testid="debtPositionTypeOrgCode"
            placeholder={t(
              'assessmentCreate.configuration.step1.fields.debtPositionType.placeholder'
            )}
            required
          />
        </Stack>
      </SectionBox>
    </WizardStepWrapper>
  );
};
