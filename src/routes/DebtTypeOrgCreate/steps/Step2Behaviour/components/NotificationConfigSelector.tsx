import { Control, useWatch } from 'react-hook-form';
import { ServiceSelector } from './ServiceSelector';
import { useNotificationConfigurations } from '../../../hooks/useNotificationConfig';
import { DebtTypeOrgForm } from '../../../types';
import { useTranslation } from 'react-i18next';
import { FormComponent } from '../../../../../components/FormComponent';

type NotificationConfigSelectorProps = {
  control: Control<DebtTypeOrgForm>;
  edit?: boolean;
};

export const NotificationConfigSelector = ({
  control,
  edit = false
}: NotificationConfigSelectorProps) => {
  const { t } = useTranslation();
  const query = useNotificationConfigurations();

  const currentValue = useWatch({
    control,
    name: 'notifyOutcomePushOrgSilServiceId'
  });

  if (edit && query.isError) {
    return (
      <FormComponent.ControlledTextField
        name="notifyOutcomePushOrgSilServiceId"
        control={control}
        label={t(
          'debtTypeOrgCreate.behaviour.notifications.configuration.label'
        )}
        value={t(
          'debtTypeOrgCreate.behaviour.actualization.configuration.errorState'
        )}
        disabled={true}
        InputProps={{
          readOnly: true
        }}
      />
    );
  }

  if (edit && currentValue === 0) {
    return (
      <FormComponent.ControlledTextField
        name="notifyOutcomePushOrgSilServiceId"
        control={control}
        label={t(
          'debtTypeOrgCreate.behaviour.notifications.configuration.label'
        )}
        value={t(
          'debtTypeOrgCreate.behaviour.notifications.configuration.none'
        )}
        disabled={true}
        InputProps={{
          readOnly: true
        }}
      />
    );
  }

  return (
    <ServiceSelector
      control={control}
      name="notifyOutcomePushOrgSilServiceId"
      labelKey="debtTypeOrgCreate.behaviour.notifications.configuration.label"
      query={query}
      edit={edit}
      required={true}
      baseTranslationKey="debtTypeOrgCreate.behaviour.notifications.configuration"
    />
  );
};
