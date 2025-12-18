import { useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TuneIcon from '@mui/icons-material/Tune';
import SectionBox from '../../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../../components/FormComponent';
import { NotificationConfigSelector } from './components/NotificationConfigSelector';
import { ActualizationConfigSelector } from './components/ActualizationConfigSelector';
import { SpontaneousModeSelector } from './components/SpontaneousModeSelector';
import { CustomFormSelector } from './components/CustomFormSelector';
import { DebtTypeOrgForm, SpontaneousMode } from '../../types';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useStore } from '../../../../store/GlobalStore';
import { getSpontaneousForms } from '../../../../api/spontaneousForms';
import utils from '../../../../utils';

export const Step2Behaviour = ({ edit }: { edit?: boolean }) => {
  const { t } = useTranslation();

  const {
    control,
    watch,
    setValue,
    clearErrors,
    formState: { errors }
  } = useFormContext<DebtTypeOrgForm>();
  const {
    state: { organizationId }
  } = useStore();

  const flagNotifyOutcomePush = watch('flagNotifyOutcomePush');
  const flagSpontaneous = watch('flagSpontaneous');
  const flagPresetAmount = watch('flagPresetAmount');
  const spontaneousMode = watch('spontaneousMode');

  const spontaneousFormsQuery: ReturnType<typeof getSpontaneousForms> =
    getSpontaneousForms(
      organizationId,
      flagSpontaneous && spontaneousMode === SpontaneousMode.CUSTOM_FORM
    );

  const customFormOptions = useMemo(() => {
    if (!spontaneousFormsQuery.data) return [];
    return spontaneousFormsQuery.data
      .filter((form) => form.spontaneousFormId != null && form.code != null)
      .map((form) => ({
        label: form.code as string,
        value: form.spontaneousFormId as number
      }));
  }, [spontaneousFormsQuery.data]);

  // Reset amount when preset amount is disabled
  useEffect(() => {
    if (!flagPresetAmount) {
      setValue('amountCents', undefined, { shouldValidate: false });
      clearErrors(['amountCents']);
    }
  }, [flagPresetAmount, setValue, clearErrors, watch, errors.amountCents]);

  // Reset spontaneous mode when spontaneous is disabled
  useEffect(() => {
    if (!flagSpontaneous) {
      setValue('spontaneousMode', undefined, { shouldValidate: false });
      setValue('externalPaymentUrl', undefined, { shouldValidate: false });
      clearErrors(['spontaneousMode', 'externalPaymentUrl', 'customFormId']);
    }
  }, [
    flagSpontaneous,
    setValue,
    clearErrors,
    watch,
    errors.spontaneousMode,
    errors.externalPaymentUrl,
    errors.customFormId
  ]);

  // Reset custom form when mode changes
  useEffect(() => {
    if (spontaneousMode !== SpontaneousMode.CUSTOM_FORM) {
      setValue('customFormId', undefined, { shouldValidate: false });
      clearErrors(['customFormId']);
    }
  }, [spontaneousMode, setValue, clearErrors, watch, errors.customFormId]);

  useEffect(() => {
    if (spontaneousFormsQuery.isError) {
      utils.notify.emit(t('errors.generic'), 'error');
    }
  }, [spontaneousFormsQuery.isError, t]);

  return (
    <WizardStepWrapper
      title={t('debtTypeOrgCreate.behaviour.title')}
      subtitle={t('debtTypeOrgCreate.behaviour.subtitle')}
      alertMessage={t('debtTypeOrgCreate.behaviour.alertMessage')}
    >
      <SectionBox
        title={t('debtTypeOrgCreate.behaviour.characteristics.title')}
        adornment={<TuneIcon />}
      >
        <FormComponent.ControlledSwitch
          control={control}
          name="flagMandatoryDueDate"
          data-testid="flagMandatoryDueDate"
          label={
            <Stack>
              <Typography>
                {t('debtTypeOrgCreate.behaviour.optionA.label')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('debtTypeOrgCreate.behaviour.optionA.description')}
              </Typography>
            </Stack>
          }
        />
        <FormComponent.ControlledSwitch
          control={control}
          name="flagAnonymousFiscalCode"
          data-testid="flagAnonymousFiscalCode"
          label={
            <Stack>
              <Typography>
                {t('debtTypeOrgCreate.behaviour.optionB.label')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('debtTypeOrgCreate.behaviour.optionB.description')}
              </Typography>
            </Stack>
          }
        />
        <FormComponent.ControlledSwitch
          control={control}
          name="flagPresetAmount"
          data-testid="flagPresetAmount"
          label={
            <Stack>
              <Typography>
                {t('debtTypeOrgCreate.behaviour.presetAmount.label')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('debtTypeOrgCreate.behaviour.presetAmount.description')}
              </Typography>
            </Stack>
          }
        />
        {flagPresetAmount && (
          <FormComponent.ControlledAmountField
            name="amountCents"
            control={control}
            label={t(
              'debtTypeOrgCreate.behaviour.spontaneous.amountValue.label'
            )}
            placeholder="0,00"
            data-testid="presetAmountValue"
            required
          />
        )}
        <FormComponent.ControlledSwitch
          control={control}
          name="flagSpontaneous"
          data-testid="flagSpontaneous"
          label={
            <Stack>
              <Typography>
                {t('debtTypeOrgCreate.behaviour.spontaneous.label')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('debtTypeOrgCreate.behaviour.spontaneous.description')}
              </Typography>
            </Stack>
          }
        />

        {flagSpontaneous && (
          <>
            <SpontaneousModeSelector
              control={control}
              errors={errors}
              spontaneousMode={spontaneousMode}
              flagPresetAmount={flagPresetAmount}
            />
            {spontaneousMode === SpontaneousMode.CUSTOM_FORM && (
              <CustomFormSelector
                control={control}
                isLoading={spontaneousFormsQuery.isLoading}
                customFormOptions={customFormOptions}
              />
            )}
          </>
        )}
      </SectionBox>

      <SectionBox
        title={t('debtTypeOrgCreate.behaviour.notifications.title')}
        adornment={<NotificationsIcon />}
      >
        <FormComponent.ControlledRadioGroup
          name="flagNotifyOutcomePush"
          data-testid="flagNotifyOutcomePush"
          control={control}
          label={t('debtTypeOrgCreate.behaviour.notifications.radioLabel')}
          sx={{ flexDirection: 'row' }}
          disabled={false}
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
        <ActualizationConfigSelector control={control} />
      </SectionBox>
    </WizardStepWrapper>
  );
};
