import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BookIcon from '@mui/icons-material/Book';
import SectionBox from '../../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../../components/FormComponent';
import { DebtTypeOrgForm } from '../../types';

export const Step3Accounting = () => {
  const { t } = useTranslation();
  const { control, watch } = useFormContext<DebtTypeOrgForm>();

  const postalIban = watch('postalIban');
  const iban = watch('iban');

  return (
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
  );
};
