import { Control } from 'react-hook-form';
import { ServiceSelector } from './ServiceSelector';
import { DebtTypeOrgForm } from '../../../types';
import { useActualizationServices } from '../../../hooks/useOrgSilServices';

type ActualizationConfigSelectorProps = {
  control: Control<DebtTypeOrgForm>;
  edit?: boolean;
};

export const ActualizationConfigSelector = ({
  control,
  edit = false
}: ActualizationConfigSelectorProps) => {
  const query = useActualizationServices();

  if (edit) {
    return (
      <ServiceSelector
        control={control}
        name="amountActualizationOrgSilServiceId"
        data-testid="amountActualizationOrgSilServiceId"
        labelKey="debtTypeOrgCreate.behaviour.actualization.configuration.label"
        query={query}
        edit={edit}
        required={false}
        baseTranslationKey="debtTypeOrgCreate.behaviour.actualization.configuration"
      />
    );
  }

  return (
    <ServiceSelector
      control={control}
      name="amountActualizationOrgSilServiceId"
      data-testid="amountActualizationOrgSilServiceId"
      labelKey="debtTypeOrgCreate.behaviour.actualization.configuration.label"
      query={query}
      edit={edit}
      required={false}
      baseTranslationKey="debtTypeOrgCreate.behaviour.actualization.configuration"
    />
  );
};
