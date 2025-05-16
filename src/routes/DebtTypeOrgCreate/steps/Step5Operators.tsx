import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import PeopleIcon from '@mui/icons-material/People';
import { TFunction } from 'i18next';
import { z } from 'zod';
import SectionBox from '../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../components/FormComponent';
import WizardStepButtons from '../../../components/Wizard/WizardStepButtons';
import { OperatorsSelection } from '../../../../generated/data-contracts';

export type Step5Data = {
  operatorsSelection: OperatorsSelection;
};

export type Step5Props = {
  setData: (data: Step5Data) => void;
  onNext: () => void;
  onBack: () => void;
};

const validationSchema = (t: TFunction) =>
  z.object({
    operatorsSelection: z.nativeEnum(OperatorsSelection, {
      required_error: t(
        'debtTypeOrgCreate.operators.operatorSelection.required'
      )
    })
  });

export const Step5Operators = ({ setData, onNext, onBack }: Step5Props) => {
  const { t } = useTranslation();
  const schema = validationSchema(t);
  const form = useForm<Step5Data>({
    resolver: zodResolver(schema),
    defaultValues: {
      operatorsSelection: OperatorsSelection.ALL
    },
    mode: 'onTouched'
  });
  const { control, handleSubmit } = form;

  const onSubmit = async (values: Step5Data) => {
    setData(values);
    onNext();
  };

  return (
    <form aria-label="form">
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
                value: OperatorsSelection.NONE,
                label: t('debtTypeOrgCreate.operators.options.none')
              }
            ]}
          />
        </SectionBox>
      </WizardStepWrapper>
      <WizardStepButtons onBack={onBack} onNext={handleSubmit(onSubmit)} />
    </form>
  );
};
