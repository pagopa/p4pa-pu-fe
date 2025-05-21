import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import PeopleIcon from '@mui/icons-material/People';
import SectionBox from '../../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../../components/FormComponent';
import { OperatorsSelection } from '../../../../../generated/data-contracts';
import { DebtTypeOrgForm } from '../../types';
import OperatorSelector from './components/OperatorSelector';

export const Step5Operators = () => {
  const { t } = useTranslation();
  const { control, watch, setValue } = useFormContext<DebtTypeOrgForm>();

  const operatorSelection = watch('operatorsSelection');

  const handleOperatorSelectionChange = (enabledOperators: Array<string>) => {
    setValue('enabledOperators', enabledOperators);
  };

  return (
    <WizardStepWrapper
      title={t('debtTypeOrgCreate.operators.title')}
      subtitle={t('debtTypeOrgCreate.operators.subtitle')}
    >
      <SectionBox
        title={t('debtTypeOrgCreate.operators.section.operatorEntities')}
        adornment={<PeopleIcon />}
      >
        <FormComponent.ControlledRadioGroup
          name="operatorsSelection"
          control={control}
          options={[
            {
              value: OperatorsSelection.ALL,
              label: t('debtTypeOrgCreate.operators.options.all')
            },
            {
              value: OperatorsSelection.SELECTED,
              label: t('debtTypeOrgCreate.operators.options.selected')
            },
            {
              value: OperatorsSelection.NONE,
              label: t('debtTypeOrgCreate.operators.options.none')
            }
          ]}
        />
        {operatorSelection === OperatorsSelection.SELECTED && (
          <OperatorSelector
            onSelectionChange={handleOperatorSelectionChange}
            enabledOperators={watch('enabledOperators') || []}
            organizationId={3}
          />
        )}
      </SectionBox>
    </WizardStepWrapper>
  );
};
