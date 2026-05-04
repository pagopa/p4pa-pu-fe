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
  const { control } = useFormContext<DebtTypeOrgForm>();

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
          data-testid="postalIban"
          control={control}
          label={t('debtTypeOrgCreate.accounting.postalIban')}
          required={false}
          InputLabelProps={{ shrink: true }}
        />
        <FormComponent.ControlledTextField
          name="iban"
          data-testid="iban"
          control={control}
          label={t('debtTypeOrgCreate.accounting.pspIban')}
          required={false}
          InputLabelProps={{ shrink: true }}
        />
        <FormComponent.ControlledTextField
          name="postalAccountCode"
          data-testid="postalAccountCode"
          control={control}
          label={t('debtTypeOrgCreate.accounting.postalAccount')}
          required={false}
          InputLabelProps={{ shrink: true }}
        />
        <FormComponent.ControlledTextField
          name="holderPostalCc"
          data-testid="holderPostalCc"
          control={control}
          label={t('debtTypeOrgCreate.accounting.postalAccountHolder')}
          required={false}
          InputLabelProps={{ shrink: true }}
        />
      </SectionBox>
      <SectionBox
        title={t('debtTypeOrgCreate.accounting.section.budgetInfo')}
        adornment={<BookIcon />}
      >
        <FormComponent.ControlledTextField
          name="balance"
          data-testid="balance"
          control={control}
          label={t('debtTypeOrgCreate.accounting.defaultBudgetStructure')}
          multiline
          InputLabelProps={{ shrink: true }}
          rows={4}
          required={false}
        />
        <FormComponent.ControlledTextField
          name="orgSector"
          data-testid="orgSector"
          control={control}
          label={t('debtTypeOrgCreate.accounting.entitySector')}
          required={false}
          InputLabelProps={{ shrink: true }}
        />
      </SectionBox>
    </WizardStepWrapper>
  );
};
