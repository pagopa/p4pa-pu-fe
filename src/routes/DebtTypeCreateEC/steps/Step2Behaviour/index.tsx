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
  isSpontaneousPaymentEnabled?: boolean;
  paymentMethod: PaymentMethodOption;
  enablePaymentNotifications?: string;
  authenticateUsername?: string;
  authenticatePassword?: string;
  authCallbackUrl?: string;
  updateCallbackUrl?: string;
  isDueDateRequired?: boolean;
  isAnonymousFiscalCode?: boolean;
  fixedAmount?: string;
  customFieldsSchema?: File;
  externalPaymentUrl?: string;
  notificationRetries?: string;
  notificationAppName?: string;
  notificationEndpoint?: string;
  enableJwtAuth?: boolean;
  clientId?: string;
  clientEmail?: string;
  secretKeyId?: string;
  secretKey?: string;
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

  const isSpontaneous = watch('isSpontaneousPaymentEnabled');
  const enableNotifications = watch('enablePaymentNotifications');

  const onSubmit = (values: Step2Data) => {
    setData(values);
    onNext();
  };

  return (
    <form aria-label="form" onSubmit={handleSubmit(onSubmit)}>
      <WizardStepWrapper
        title={t('debtTypeCreateEC.behaviour.title')}
        subtitle={t('debtTypeCreateEC.behaviour.subtitle')}
        alertMessage={t('debtTypeCreateEC.behaviour.alertMessage')}
      >
        <FormComponent.ControlledSwitch
          control={control}
          name="isSpontaneousPaymentEnabled"
          label={t('debtTypeCreateEC.behaviour.postalAccount')}
        />

        {isSpontaneous ? (
          <SectionBox
            title={t(
              'debtTypeCreateEC.behaviour.section.spontaneousPaymentTitle'
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
            title={t('debtTypeCreateEC.behaviour.section.behaviourTitle')}
            adornment={<TuneIcon />}
          >
            <FormComponent.ControlledCheckbox
              control={control}
              name="isDueDateRequired"
              label={t('debtTypeCreateEC.behaviour.optionA.label')}
              description={t('debtTypeCreateEC.behaviour.optionA.description')}
            />
            <FormComponent.ControlledCheckbox
              control={control}
              name="isAnonymousFiscalCode"
              label={t('debtTypeCreateEC.behaviour.optionB.label')}
              description={t('debtTypeCreateEC.behaviour.optionB.description')}
            />
          </SectionBox>
        )}

        <SectionBox
          title={t('debtTypeCreateEC.behaviour.notifications.title')}
          adornment={<NotificationsIcon />}
        >
          <FormComponent.ControlledRadioGroup
            name="enablePaymentNotifications"
            control={control}
            label={t('debtTypeCreateEC.behaviour.notifications.radioLabel')}
            sx={{ flexDirection: 'row' }}
            options={[
              {
                value: 'false',
                label: t('debtTypeCreateEC.behaviour.notifications.options.no')
              },
              {
                value: 'true',
                label: t('debtTypeCreateEC.behaviour.notifications.options.yes')
              }
            ]}
          />
          {enableNotifications === 'true' && (
            <PaymentNotificationFields control={control} />
          )}
        </SectionBox>

        <SectionBox
          title={t('debtTypeCreateEC.behaviour.updateAmount.title')}
          subtitle={t('debtTypeCreateEC.behaviour.updateAmount.subtitle')}
          adornment={<MonetizationOnIcon />}
        >
          <Stack direction="row" spacing={2}>
            <FormComponent.ControlledTextField
              name="authenticateUsername"
              control={control}
              label={t('debtTypeCreateEC.behaviour.updateAmount.notesLabel')}
              required={false}
            />
            <FormComponent.ControlledTextField
              name="authenticatePassword"
              control={control}
              label={t('debtTypeCreateEC.behaviour.updateAmount.amountLabel')}
              required={false}
            />
          </Stack>
          <Stack direction="row" spacing={2} mt={2}>
            <FormComponent.ControlledTextField
              name="authCallbackUrl"
              control={control}
              label={t('debtTypeCreateEC.behaviour.updateAmount.authUrlLabel')}
              required={false}
            />
            <FormComponent.ControlledTextField
              name="updateCallbackUrl"
              control={control}
              label={t(
                'debtTypeCreateEC.behaviour.updateAmount.updateUrlLabel'
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
