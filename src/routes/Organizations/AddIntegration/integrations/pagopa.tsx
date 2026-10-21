import WizardStepWrapper from '@core/components/Wizard/WizardStepWrapper';
import { OrganizationApiKeyType } from '@generated/core/data-contracts';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Control, useController } from 'react-hook-form';
import type { AddIntegrationFormData } from '..';
import { useEffect } from 'react';

const Product = ({ control }: { control: Control<AddIntegrationFormData> }) => {
  const { t } = useTranslation();
  const { field } = useController({
    name: 'PAGOPA_PRODUCT.apiKey',
    control
  });
  return (
    <WizardStepWrapper
      title={t('integrations.add.pagoPaProduct.config.title')}
      subtitle={t('integrations.add.pagoPaProduct.config.subtitle')}
      sx={{ marginTop: 2 }}
    >
      <FormControl fullWidth required>
        <TextField
          name={field.name}
          value={field.value ?? ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          label={t('integrations.add.pagoPaProduct.config.apiKey')}
          variant="outlined"
          required
        />
      </FormControl>
    </WizardStepWrapper>
  );
};

const PagoPAIntegration = ({
  availableApiKeys,
  control
}: {
  availableApiKeys: Array<
    OrganizationApiKeyType.IO | OrganizationApiKeyType.GENERATE_NOTICE
  >;
  control: Control<AddIntegrationFormData>;
}) => {
  const { t } = useTranslation();
  const { field } = useController({
    name: 'PAGOPA_PRODUCT.type',
    control
  });
  const { value, onChange } = field;
  const firstAvailableApiKey = availableApiKeys[0];

  useEffect(() => {
    if (value === undefined) {
      onChange(firstAvailableApiKey);
    }
  }, [value, onChange, firstAvailableApiKey]);

  return (
    <>
      <WizardStepWrapper
        title={t('integrations.add.pagoPaProduct.title')}
        subtitle={t('integrations.add.pagoPaProduct.subtitle')}
        sx={{ marginTop: 2 }}
      >
        <FormControl fullWidth required>
          <InputLabel id="api-Key-list">
            {t('integrations.add.pagoPaProduct.products')}
          </InputLabel>
          <Select
            name={field.name}
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            labelId="api-Key-list"
            label={t('integrations.add.pagoPaProduct.products')}
          >
            {availableApiKeys.map((keyType) => (
              <MenuItem value={keyType} key={keyType}>
                {t(`integrations.add.pagoPaProduct.${keyType}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </WizardStepWrapper>
      <Product control={control} />
    </>
  );
};

export default PagoPAIntegration;
