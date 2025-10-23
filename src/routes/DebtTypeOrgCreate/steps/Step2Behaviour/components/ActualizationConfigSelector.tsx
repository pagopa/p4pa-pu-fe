import { Control } from 'react-hook-form';
import { ServiceSelector } from './ServiceSelector';
import { DebtTypeOrgForm } from '../../../types';
import { useActualizationServices } from '../../../hooks/useOrgSilServices';

type ActualizationConfigSelectorProps = {
  control: Control<DebtTypeOrgForm>;
};

export const ActualizationConfigSelector = ({
  control
}: ActualizationConfigSelectorProps) => {
  const query = useActualizationServices();

  return (
    <ServiceSelector
      control={control}
      name="amountActualizationOrgSilServiceId"
      data-testid="amountActualizationOrgSilServiceId"
      labelKey="debtTypeOrgCreate.behaviour.actualization.configuration.label"
      query={query}
      required={false}
      baseTranslationKey="debtTypeOrgCreate.behaviour.actualization.configuration"
    />
  );
};
