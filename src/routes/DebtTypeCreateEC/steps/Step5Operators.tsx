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

export enum OperatorSelection {
  ALL = 'ALL',
  NONE = 'NONE'
}

export type Step5Data = {
  operatorSelection: OperatorSelection;
};

export type Step5Props = {
  setData: (data: Step5Data) => void;
  onNext: () => void;
  onBack: () => void;
};

const validationSchema = (t: TFunction) =>
  z.object({
    operatorSelection: z.nativeEnum(OperatorSelection, {
      required_error: t('debtTypeCreateEC.operators.operatorSelection.required')
    })
  });

export const Step5Operators = ({ setData, onNext, onBack }: Step5Props) => {
  const { t } = useTranslation();
  const schema = validationSchema(t);
  const form = useForm<Step5Data>({
    resolver: zodResolver(schema),
    defaultValues: {
      operatorSelection: OperatorSelection.ALL
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
        title={t('debtTypeCreateEC.operators.title')}
        subtitle={t('debtTypeCreateEC.operators.subtitle')}
      >
        <SectionBox
          title={t('debtTypeCreateEC.operators.section.operatorEntities')}
          adornment={<PeopleIcon />}
        >
          <FormComponent.ControlledRadioGroup
            name="operatorSelection"
            control={control}
            options={[
              {
                value: OperatorSelection.ALL,
                label: t('debtTypeCreateEC.operators.options.all')
              },
              {
                value: OperatorSelection.NONE,
                label: t('debtTypeCreateEC.operators.options.none')
              }
            ]}
          />
        </SectionBox>
      </WizardStepWrapper>
      <WizardStepButtons onBack={onBack} onNext={handleSubmit(onSubmit)} />
    </form>
  );
};
