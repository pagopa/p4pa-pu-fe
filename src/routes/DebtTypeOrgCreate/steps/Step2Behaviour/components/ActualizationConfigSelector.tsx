import { Control, useWatch } from 'react-hook-form';
import { ServiceSelector } from './ServiceSelector';
import { useActualizationConfigurations } from '../../../hooks/useActualizationConfig';
import { DebtTypeOrgForm } from '../../../types';
import { useTranslation } from 'react-i18next';
import { FormComponent } from '../../../../../components/FormComponent';

type ActualizationConfigSelectorProps = {
  control: Control<DebtTypeOrgForm>;
  edit?: boolean;
};

export const ActualizationConfigSelector = ({
  control,
  edit = false
}: ActualizationConfigSelectorProps) => {
  const { t } = useTranslation();
  const query = useActualizationConfigurations();

  const currentValue = useWatch({
    control,
    name: 'amountActualizationOrgSilServiceId'
  });

  if (edit && query.isError) {
    return (
      <FormComponent.ControlledTextField
        name="amountActualizationOrgSilServiceId"
        control={control}
        label={t(
          'debtTypeOrgCreate.behaviour.actualization.configuration.label'
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

  if (edit) {
    const isCurrentlyDisabled = !currentValue || currentValue == undefined;

    if (isCurrentlyDisabled) {
      return (
        <FormComponent.ControlledTextField
          name="amountActualizationOrgSilServiceId"
          control={control}
          label={t(
            'debtTypeOrgCreate.behaviour.actualization.configuration.label'
          )}
          value={t(
            'debtTypeOrgCreate.behaviour.actualization.configuration.noneSelected'
          )}
          disabled={true}
          helperText={t(
            'debtTypeOrgCreate.behaviour.actualization.configuration.noneEditHelper'
          )}
          InputProps={{
            readOnly: true
          }}
        />
      );
    } else {
      return (
        <ServiceSelector
          control={control}
          name="amountActualizationOrgSilServiceId"
          labelKey="debtTypeOrgCreate.behaviour.actualization.configuration.label"
          query={query}
          edit={edit}
          required={false}
          baseTranslationKey="debtTypeOrgCreate.behaviour.actualization.configuration"
          allowNone={false}
        />
      );
    }
  }

  return (
    <ServiceSelector
      control={control}
      name="amountActualizationOrgSilServiceId"
      labelKey="debtTypeOrgCreate.behaviour.actualization.configuration.label"
      query={query}
      edit={edit}
      required={false}
      baseTranslationKey="debtTypeOrgCreate.behaviour.actualization.configuration"
      allowNone={true}
    />
  );
};
