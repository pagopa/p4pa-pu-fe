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
import { isValidIBAN } from '../../../utils/fieldValidation';
import { TFunction } from 'i18next';

export type Step3Data = {
  postalIban?: string;
  iban?: string;
  postalAccountCode?: string;
  holderPostalCc?: string;
  balance?: string;
  orgSector?: string;
};

export type Step3Props = {
  setData: (data: Step3Data) => void;
  onNext: () => void;
  onBack: () => void;
};

const validationSchema = (t: TFunction) =>
  z.object({
    postalIban: z
      .literal(undefined)
      .or(z.literal(''))
      .or(z.string().refine(isValidIBAN, t('commons.validation.invalidIban'))),
    iban: z
      .literal(undefined)
      .or(z.literal(''))
      .or(z.string().refine(isValidIBAN, t('commons.validation.invalidIban'))),

    postalAccountCode: z.string().optional(),
    holderPostalCc: z.string().optional(),
    balance: z.string().optional(),
    orgSector: z.string().optional()
  });

export const Step3Accounting = ({ setData, onNext, onBack }: Step3Props) => {
  const { t } = useTranslation();
  const schema = validationSchema(t);
  const { control, handleSubmit, watch } = useForm<Step3Data>({
    resolver: zodResolver(schema),
    mode: 'onTouched'
  });

  const postalIban = watch('postalIban');
  const iban = watch('iban');

  const onSubmit = async (values: Step3Data) => {
    setData(values);
    onNext();
  };

  return (
    <form aria-label="form">
      <WizardStepWrapper
        title={t('debtTypeOrgCreate.accounting.title')}
        subtitle={t('debtTypeOrgCreate.accounting.subtitle')}
        alertMessage={t('debtTypeOrgCreate.accounting.alertMessage')}
      >
        <SectionBox
          title={t('debtTypeOrgCreate.accounting.section.creditInfo')}
          adornment={<AccountBalanceIcon />}
        >
          <FormComponent.ControlledTextField
            name="postalIban"
            control={control}
            label={t('debtTypeOrgCreate.accounting.postalIban')}
            disabled={!!iban}
            required={false}
          />
          <FormComponent.ControlledTextField
            name="iban"
            control={control}
            label={t('debtTypeOrgCreate.accounting.pspIban')}
            disabled={!!postalIban}
            required={false}
          />
          <FormComponent.ControlledTextField
            name="postalAccountCode"
            control={control}
            label={t('debtTypeOrgCreate.accounting.postalAccount')}
            required={false}
          />
          <FormComponent.ControlledTextField
            name="holderPostalCc"
            control={control}
            label={t('debtTypeOrgCreate.accounting.postalAccountHolder')}
            required={false}
          />
        </SectionBox>
        <SectionBox
          title={t('debtTypeOrgCreate.accounting.section.budgetInfo')}
          adornment={<BookIcon />}
        >
          <FormComponent.ControlledTextField
            name="balance"
            control={control}
            label={t('debtTypeOrgCreate.accounting.defaultBudgetStructure')}
            multiline
            InputLabelProps={{ shrink: true }}
            rows={4}
            required={false}
          />
          <FormComponent.ControlledTextField
            name="orgSector"
            control={control}
            label={t('debtTypeOrgCreate.accounting.entitySector')}
            required={false}
          />
        </SectionBox>
      </WizardStepWrapper>
      <WizardStepButtons onBack={onBack} onNext={handleSubmit(onSubmit)} />
    </form>
  );
};
