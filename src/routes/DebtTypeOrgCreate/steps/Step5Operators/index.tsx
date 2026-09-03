import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import PeopleIcon from '@mui/icons-material/People';
import SectionBox from '../../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../../components/FormComponent';
import { OperatorsSelection } from '../../../../../generated/core/data-contracts';
import { DebtTypeOrgForm } from '../../types';
import { OperatorSelector } from './components/OperatorSelector';

export const Step5Operators = ({ edit }: { edit?: boolean }) => {
  const { t } = useTranslation();
  const { control } = useFormContext<DebtTypeOrgForm>();

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
          data-testid="operatorsSelection"
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
        <OperatorSelector edit={edit} />
      </SectionBox>
    </WizardStepWrapper>
  );
};
