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
import { useNotificationConfigurations } from '../../hooks/useNotificationConfig';
import { DebtTypeOrgForm } from '../../types';
import React from 'react';
import utils from '../../../../utils';
import { useActualizationConfigurations } from '../../hooks/useActualizationConfig';

export const Step2Behaviour = ({ edit }: { edit?: boolean }) => {
  const { t } = useTranslation();
  const notificationQuery = useNotificationConfigurations();
  const actualizationQuery = useActualizationConfigurations();

  const { control, watch } = useFormContext<DebtTypeOrgForm>();

  const isSpontaneous = watch('flagSpontaneous');
  const flagNotifyOutcomePush = watch('flagNotifyOutcomePush');

  // Blocca silenziosamente il radio button se c'è un errore API in edit
  const shouldDisableNotificationRadio = edit && notificationQuery.isError;

  if (edit) {
    const hasNotificationError = notificationQuery.isError;
    const hasActualizationError = actualizationQuery.isError;

    // Usa un ref per evitare notifiche multiple
    const notificationShown = React.useRef(false);

    if (
      !notificationShown.current &&
      (hasNotificationError || hasActualizationError)
    ) {
      notificationShown.current = true;

      if (hasNotificationError && hasActualizationError) {
        utils.notify.emit(
          t('debtTypeOrgCreate.behaviour.errors.bothServicesUnavailable'),
          'warning'
        );
      } else if (hasNotificationError) {
        utils.notify.emit(
          t(
            'debtTypeOrgCreate.behaviour.errors.notificationServiceUnavailable'
          ),
          'warning'
        );
      } else if (hasActualizationError) {
        utils.notify.emit(
          t(
            'debtTypeOrgCreate.behaviour.errors.actualizationServiceUnavailable'
          ),
          'warning'
        );
      }
    }
  }

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
          disabled={shouldDisableNotificationRadio}
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
        <ActualizationConfigSelector control={control} edit={edit} />
      </SectionBox>
    </WizardStepWrapper>
  );
};
