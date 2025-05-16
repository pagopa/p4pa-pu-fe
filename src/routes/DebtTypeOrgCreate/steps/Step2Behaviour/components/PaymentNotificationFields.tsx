import { FormComponent } from '../../../../../components/FormComponent';
import Stack from '@mui/material/Stack';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import { Step2Data } from '../../Step2Behaviour';

type PaymentNotificationFieldsProps = {
  control: Control<Step2Data>;
};

export const PaymentNotificationFields = ({
  control
}: PaymentNotificationFieldsProps) => {
  const { t } = useTranslation();

  return (
    <Stack spacing={2} mt={2}>
      <Stack gap={0.5}>
        <FormComponent.ControlledSelect
          name="notificationRetries"
          control={control}
          label={t('debtTypeOrgCreate.behaviour.notifications.fields.retries')}
          options={[
            { label: '1', value: 1 },
            { label: '2', value: 2 },
            { label: '5', value: 5 },
            { label: '10', value: 10 }
          ]}
        />
        <Typography variant="caption" ml={2}>
          {t(
            'debtTypeOrgCreate.behaviour.notifications.fields.retriesDescription'
          )}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2}>
        <FormComponent.ControlledTextField
          name="notificationAppName"
          control={control}
          label={t('debtTypeOrgCreate.behaviour.notifications.fields.appName')}
        />
        <FormComponent.ControlledTextField
          name="notificationEndpoint"
          control={control}
          label={t('debtTypeOrgCreate.behaviour.notifications.fields.endpoint')}
        />
        <FormComponent.ControlledCheckbox
          name="enableJwtAuth"
          control={control}
          label={t('debtTypeOrgCreate.behaviour.notifications.fields.jwt')}
        />
      </Stack>
      <Stack direction="row" spacing={2}>
        <FormComponent.ControlledTextField
          name="clientId"
          control={control}
          label={t('debtTypeOrgCreate.behaviour.notifications.fields.clientId')}
        />
        <FormComponent.ControlledTextField
          name="clientEmail"
          control={control}
          label={t(
            'debtTypeOrgCreate.behaviour.notifications.fields.clientEmail'
          )}
        />
      </Stack>
      <Stack direction="row" spacing={2}>
        <FormComponent.ControlledTextField
          name="secretKeyId"
          control={control}
          label={t(
            'debtTypeOrgCreate.behaviour.notifications.fields.secretKeyId'
          )}
        />
        <FormComponent.ControlledTextField
          name="secretKey"
          control={control}
          label={t(
            'debtTypeOrgCreate.behaviour.notifications.fields.secretKey'
          )}
        />
      </Stack>
    </Stack>
  );
};
