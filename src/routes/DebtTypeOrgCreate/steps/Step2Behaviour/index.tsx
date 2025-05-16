import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import TuneIcon from '@mui/icons-material/Tune';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt';
import Stack from '@mui/material/Stack';

import SectionBox from '../../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../../components/FormComponent';
import WizardStepButtons from '../../../../components/Wizard/WizardStepButtons';
import { step2Schema } from './schema';
import {
  PaymentMethodOption,
  PaymentMethodSelector
} from './components/PaymentMethodSelector';
import { PaymentNotificationFields } from './components/PaymentNotificationFields';

export type Step2Data = {
  flagSpontaneous?: boolean;

  flagMandatoryDueDate?: boolean;
  flagAnonymousFiscalCode?: boolean;

  // FREE if nothing is passed
  paymentMethod: PaymentMethodOption;

  amountCents?: number;
  externalPaymentUrl?: string;
  xsdDefinitionRef?: File;

  flagNotifyOutcomePush?: 'true' | 'false';

  // TODO Missing in api
  notificationRetries?: number;
  notificationAppName?: string;
  notificationEndpoint?: string;
  enableJwtAuth?: boolean;
  clientId?: string;
  clientEmail?: string;
  secretKeyId?: string;
  secretKey?: string;

  // TODO Missing in api
  authenticateUsername?: string;
  authenticatePassword?: string;
  authCallbackUrl?: string;
  updateCallbackUrl?: string;
};

export type Step2Props = {
  setData: (data: Step2Data) => void;
  onNext: () => void;
  onBack: () => void;
};

export const Step2Behaviour = ({ setData, onNext, onBack }: Step2Props) => {
  const { t } = useTranslation();
  const schema = step2Schema(t);

  const { control, handleSubmit, watch } = useForm<Step2Data>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      paymentMethod: PaymentMethodOption.FREE
    }
  });

  const isSpontaneous = watch('flagSpontaneous');
  const enableNotifications = watch('flagNotifyOutcomePush');

  const onSubmit = (values: Step2Data) => {
    setData(values);
    onNext();
  };

  return (
    <form aria-label="form" onSubmit={handleSubmit(onSubmit)}>
      <WizardStepWrapper
        title={t('debtTypeOrgCreate.behaviour.title')}
        subtitle={t('debtTypeOrgCreate.behaviour.subtitle')}
        alertMessage={t('debtTypeOrgCreate.behaviour.alertMessage')}
      >
        <FormComponent.ControlledSwitch
          control={control}
          name="flagSpontaneous"
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
              selectedValue={watch('paymentMethod')}
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
            />
            <FormComponent.ControlledCheckbox
              control={control}
              name="flagAnonymousFiscalCode"
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
            control={control}
            label={t('debtTypeOrgCreate.behaviour.notifications.radioLabel')}
            sx={{ flexDirection: 'row' }}
            options={[
              {
                value: 'false',
                label: t('debtTypeOrgCreate.behaviour.notifications.options.no')
              },
              {
                value: 'true',
                label: t(
                  'debtTypeOrgCreate.behaviour.notifications.options.yes'
                )
              }
            ]}
          />
          {enableNotifications === 'true' && (
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
              label={t(
                'debtTypeOrgCreate.behaviour.updateAmount.updateUrlLabel'
              )}
              required={false}
            />
          </Stack>
        </SectionBox>
      </WizardStepWrapper>
      <WizardStepButtons onBack={onBack} onNext={handleSubmit(onSubmit)} />
    </form>
  );
};
