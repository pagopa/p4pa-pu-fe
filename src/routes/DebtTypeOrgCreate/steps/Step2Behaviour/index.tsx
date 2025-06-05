import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import TuneIcon from '@mui/icons-material/Tune';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt';
import Stack from '@mui/material/Stack';

import SectionBox from '../../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../../components/FormComponent';
import { PaymentMethodSelector } from './components/PaymentMethodSelector';
import { PaymentNotificationFields } from './components/PaymentNotificationFields';
import { DebtTypeOrgForm } from '../../types';

export const Step2Behaviour = ({ edit }: { edit?: boolean }) => {
  const { t } = useTranslation();

  const { control, watch } = useFormContext<DebtTypeOrgForm>();

  const isSpontaneous = watch('flagSpontaneous');
  const flagNotifyOutcomePush = watch('flagNotifyOutcomePush');

  return (
    <WizardStepWrapper
      title={t('debtTypeOrgCreate.behaviour.title')}
      subtitle={t('debtTypeOrgCreate.behaviour.subtitle')}
      alertMessage={t('debtTypeOrgCreate.behaviour.alertMessage')}
    >
      <FormComponent.ControlledSwitch
        control={control}
        name="flagSpontaneous"
        label={t('debtTypeOrgCreate.behaviour.postalAccount')}
        disabled={edit}
      />

      {isSpontaneous ? (
        <SectionBox
          title={t(
            'debtTypeOrgCreate.behaviour.section.spontaneousPaymentTitle'
          )}
          adornment={<OfflineBoltIcon />}
        >
          <PaymentMethodSelector
            control={control}
            name="paymentMethod"
            selectedValue={watch('paymentMethod')}
            edit={edit}
          />
        </SectionBox>
      ) : (
        <SectionBox
          title={t('debtTypeOrgCreate.behaviour.section.behaviourTitle')}
          adornment={<TuneIcon />}
        >
          <FormComponent.ControlledCheckbox
            control={control}
            name="flagMandatoryDueDate"
            label={t('debtTypeOrgCreate.behaviour.optionA.label')}
            description={t('debtTypeOrgCreate.behaviour.optionA.description')}
            disabled={edit}
          />
          <FormComponent.ControlledCheckbox
            control={control}
            name="flagAnonymousFiscalCode"
            label={t('debtTypeOrgCreate.behaviour.optionB.label')}
            description={t('debtTypeOrgCreate.behaviour.optionB.description')}
            disabled={edit}
          />
        </SectionBox>
      )}

      <SectionBox
        title={t('debtTypeOrgCreate.behaviour.notifications.title')}
        adornment={<NotificationsIcon />}
      >
        <FormComponent.ControlledRadioGroup
          name="flagNotifyOutcomePush"
          control={control}
          label={t('debtTypeOrgCreate.behaviour.notifications.radioLabel')}
          sx={{ flexDirection: 'row' }}
          options={[
            {
              value: 'disabled',
              label: t('debtTypeOrgCreate.behaviour.notifications.options.no')
            },
            {
              value: 'enabled',
              label: t('debtTypeOrgCreate.behaviour.notifications.options.yes')
            }
          ]}
        />
        {flagNotifyOutcomePush === 'enabled' && (
          <PaymentNotificationFields control={control} />
        )}
      </SectionBox>

      <SectionBox
        title={t('debtTypeOrgCreate.behaviour.updateAmount.title')}
        subtitle={t('debtTypeOrgCreate.behaviour.updateAmount.subtitle')}
        adornment={<MonetizationOnIcon />}
      >
        <Stack direction="row" spacing={2}>
          <FormComponent.ControlledTextField
            name="authenticateUsername"
            control={control}
            label={t('debtTypeOrgCreate.behaviour.updateAmount.notesLabel')}
            required={false}
          />
          <FormComponent.ControlledTextField
            name="authenticatePassword"
            control={control}
            label={t('debtTypeOrgCreate.behaviour.updateAmount.amountLabel')}
            required={false}
          />
        </Stack>
        <Stack direction="row" spacing={2} mt={2}>
          <FormComponent.ControlledTextField
            name="authCallbackUrl"
            control={control}
            label={t('debtTypeOrgCreate.behaviour.updateAmount.authUrlLabel')}
            required={false}
          />
          <FormComponent.ControlledTextField
            name="updateCallbackUrl"
            control={control}
            label={t('debtTypeOrgCreate.behaviour.updateAmount.updateUrlLabel')}
            required={false}
          />
        </Stack>
      </SectionBox>
    </WizardStepWrapper>
  );
};
