import WizardStepWrapper from '@core/components/Wizard/WizardStepWrapper';
import { OrganizationApiKeyType } from '@generated/core/data-contracts';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Control, useController } from 'react-hook-form';
import type { AddIntegrationFormData } from '..';
import { useEffect } from 'react';

const Product = ({
  control,
  productType
}: {
  control: Control<AddIntegrationFormData>;
  productType: OrganizationApiKeyType | undefined;
}) => {
  const { t } = useTranslation();
  const { field: apiKeyField } = useController({
    name: 'PAGOPA_PRODUCT.apiKey',
    control
  });
  const { field: serviceEnabled } = useController({
    name: 'PAGOPA_PRODUCT.serviceEnabled',
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
          name={apiKeyField.name}
          value={apiKeyField.value ?? ''}
          onChange={apiKeyField.onChange}
          onBlur={apiKeyField.onBlur}
          label={t('integrations.add.pagoPaProduct.config.apiKey')}
          variant="outlined"
          required
        />
      </FormControl>
      {productType === OrganizationApiKeyType.IO && (
        <>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            justifyContent="space-between"
            mt={4}
          >
            <Typography fontSize={16} variant="body1" fontWeight={600}>
              {t('integrations.add.pagoPaProduct.config.IO.title')}
            </Typography>
            <Switch
              name={serviceEnabled.name}
              checked={serviceEnabled.value ?? false}
              onChange={(e) => serviceEnabled.onChange(e.target.checked)}
            />
          </Stack>
          <Typography fontSize={14} variant="caption" color="textSecondary">
            {t('integrations.add.pagoPaProduct.config.IO.subtitle')}
          </Typography>
        </>
      )}
    </WizardStepWrapper>
  );
};

const PagoPAIntegration = ({
  availableApiKeys,
  control,
  readOnly = false
}: {
  availableApiKeys: Array<
    OrganizationApiKeyType.IO | OrganizationApiKeyType.GENERATE_NOTICE
  >;
  control: Control<AddIntegrationFormData>;
  readOnly?: boolean;
}) => {
  const { t } = useTranslation();
  const { field } = useController({
    name: 'PAGOPA_PRODUCT.keyType',
    control
  });
  const { value, onChange } = field;
  const firstAvailableApiKey = availableApiKeys[0];

  useEffect(() => {
    if (!readOnly && value === undefined) {
      onChange(firstAvailableApiKey);
    }
  }, [value, onChange, firstAvailableApiKey, readOnly]);

  const selectedOptions = value === undefined ? [] : [value];
  const productOptions = readOnly ? selectedOptions : availableApiKeys;

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
            readOnly={readOnly}
            name={field.name}
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            labelId="api-Key-list"
            label={t('integrations.add.pagoPaProduct.products')}
          >
            {productOptions.map((keyType) => (
              <MenuItem value={keyType} key={keyType}>
                {t(`integrations.add.pagoPaProduct.${keyType}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </WizardStepWrapper>
      <Product control={control} productType={value} />
    </>
  );
};

export default PagoPAIntegration;
