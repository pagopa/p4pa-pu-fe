import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BookIcon from '@mui/icons-material/Book';
import { z } from 'zod';
import SectionBox from '../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../components/FormComponent';
import WizardStepButtons from '../../../components/Wizard/WizardStepButtons';

export type Step3Data = {
  postalIban?: string;
  pspIban?: string;
  postalAccount?: string;
  postalAccountHolder?: string;
  defaultBudgetStructure?: string;
  entitySector?: string;
};

export type Step3Props = {
  setData: (data: Step3Data) => void;
  onNext: () => void;
  onBack: () => void;
};

const validationSchema = () =>
  z.object({
    postalIban: z.string().optional(),
    pspIban: z.string().optional(),
    postalAccount: z.string().optional(),
    postalAccountHolder: z.string().optional(),
    defaultBudgetStructure: z.string().optional(),
    entitySector: z.string().optional()
  });

export const Step3Accounting = ({ setData, onNext, onBack }: Step3Props) => {
  const { t } = useTranslation();
  const schema = validationSchema();
  const form = useForm<Step3Data>({
    resolver: zodResolver(schema),
    mode: 'onTouched'
  });
  const { control, handleSubmit } = form;

  const onSubmit = async (values: Step3Data) => {
    setData(values);
    onNext();
  };

  return (
    <form aria-label="form">
      <WizardStepWrapper
        title={t('debtTypeCreateEC.accounting.title')}
        subtitle={t('debtTypeCreateEC.accounting.subtitle')}
        alertMessage={t('debtTypeCreateEC.accounting.alertMessage')}
      >
        <SectionBox
          title={t('debtTypeCreateEC.accounting.section.creditInfo')}
          adornment={<AccountBalanceIcon />}
        >
          <FormComponent.ControlledTextField
            name="postalIban"
            control={control}
            label={t('debtTypeCreateEC.accounting.postalIban')}
            required={false}
          />
          <FormComponent.ControlledTextField
            name="pspIban"
            control={control}
            label={t('debtTypeCreateEC.accounting.pspIban')}
            required={false}
          />
          <FormComponent.ControlledTextField
            name="postalAccount"
            control={control}
            label={t('debtTypeCreateEC.accounting.postalAccount')}
            required={false}
          />
          <FormComponent.ControlledTextField
            name="postalAccountHolder"
            control={control}
            label={t('debtTypeCreateEC.accounting.postalAccountHolder')}
            required={false}
          />
        </SectionBox>
        <SectionBox
          title={t('debtTypeCreateEC.accounting.section.budgetInfo')}
          adornment={<BookIcon />}
        >
          <FormComponent.ControlledTextField
            name="defaultBudgetStructure"
            control={control}
            label={t('debtTypeCreateEC.accounting.defaultBudgetStructure')}
            multiline
            InputLabelProps={{ shrink: true }}
            rows={4}
            required={false}
          />
          <FormComponent.ControlledTextField
            name="entitySector"
            control={control}
            label={t('debtTypeCreateEC.accounting.entitySector')}
            required={false}
          />
        </SectionBox>
      </WizardStepWrapper>
      <WizardStepButtons onBack={onBack} onNext={handleSubmit(onSubmit)} />
    </form>
  );
};
