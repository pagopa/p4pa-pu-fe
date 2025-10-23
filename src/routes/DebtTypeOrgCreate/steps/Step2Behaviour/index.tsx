import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import TuneIcon from '@mui/icons-material/Tune';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt';

import SectionBox from '../../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../../components/FormComponent';
import { PaymentMethodSelector } from './components/PaymentMethodSelector';
import { NotificationConfigSelector } from './components/NotificationConfigSelector';
import { ActualizationConfigSelector } from './components/ActualizationConfigSelector';
import { DebtTypeOrgForm } from '../../types';

export const Step2Behaviour = ({ edit }: { edit?: boolean }) => {
  const { t } = useTranslation();

  const { control, watch } = useFormContext<DebtTypeOrgForm>();

  const isSpontaneous = watch('flagSpontaneous');
  const flagNotifyOutcomePush = watch('flagNotifyOutcomePush');
  const paymentMethod = watch('paymentMethod');

  return (
    <WizardStepWrapper
      title={t('debtTypeOrgCreate.behaviour.title')}
      subtitle={t('debtTypeOrgCreate.behaviour.subtitle')}
      alertMessage={t('debtTypeOrgCreate.behaviour.alertMessage')}
    >
      <FormComponent.ControlledSwitch
        control={control}
        name="flagSpontaneous"
        data-testid="flagSpontaneous"
        label={t('debtTypeOrgCreate.behaviour.postalAccount')}
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
            data-testid="paymentMethod"
            selectedValue={paymentMethod}
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
            data-testid="flagMandatoryDueDate"
            label={t('debtTypeOrgCreate.behaviour.optionA.label')}
            description={t('debtTypeOrgCreate.behaviour.optionA.description')}
          />
          <FormComponent.ControlledCheckbox
            control={control}
            name="flagAnonymousFiscalCode"
            data-testid="flagAnonymousFiscalCode"
            label={t('debtTypeOrgCreate.behaviour.optionB.label')}
            description={t('debtTypeOrgCreate.behaviour.optionB.description')}
          />
        </SectionBox>
      )}

      <SectionBox
        title={t('debtTypeOrgCreate.behaviour.notifications.title')}
        adornment={<NotificationsIcon />}
      >
        <FormComponent.ControlledRadioGroup
          name="flagNotifyOutcomePush"
          data-testid="flagNotifyOutcomePush"
          control={control}
          label={t('debtTypeOrgCreate.behaviour.notifications.radioLabel')}
          sx={{ flexDirection: 'row' }}
          disabled={false}
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
          <NotificationConfigSelector control={control} edit={edit} />
        )}
      </SectionBox>

      <SectionBox
        title={t('debtTypeOrgCreate.behaviour.actualization.title')}
        subtitle={t('debtTypeOrgCreate.behaviour.actualization.subtitle')}
        adornment={<MonetizationOnIcon />}
      >
        <ActualizationConfigSelector control={control} />
      </SectionBox>
    </WizardStepWrapper>
  );
};
