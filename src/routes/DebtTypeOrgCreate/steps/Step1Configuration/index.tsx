import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import PostAddIcon from '@mui/icons-material/PostAdd';
import BookIcon from '@mui/icons-material/MenuBook';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import SectionBox from '../../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../../components/FormComponent';
import { useStore } from '../../../../store/GlobalStore';
import { useDebtPositionTypesByOrg } from '../../../../hooks/useDebtPositionTypesByOrg';
import { useEffect } from 'react';
import { DebtTypeOrgForm } from '../../types';
import { useParams } from 'react-router';
import { getDebtPositionTypeOrgById } from '../../../../api/debtPositionsTypeOrg';
import { useActualizationConfigurations } from '../../hooks/useActualizationConfig';
import { useNotificationConfigurations } from '../../hooks/useNotificationConfig';

export type Step1Data = {
  debtPositionTypeId: string;
  description: string;
  code: string;
};

export const Step1Configuration = ({ edit }: { edit?: boolean }) => {
  const { t } = useTranslation();

  const {
    state: { organizationId }
  } = useStore();

  const { debtPositionTypeOrgId } = useParams<{
    debtPositionTypeOrgId: string;
  }>();

  const selectionQuery = useDebtPositionTypesByOrg({
    organizationId
  });

  const detailQuery = getDebtPositionTypeOrgById({
    organizationId,
    debtPositionTypeOrgId: Number(debtPositionTypeOrgId)
  });

  const actualizationQuery = useActualizationConfigurations();
  const notificationQuery = useNotificationConfigurations();

  const { control, watch, setValue, trigger, reset, getValues } =
    useFormContext<DebtTypeOrgForm>();

  const description = watch('description');
  const selectedId = watch('debtPositionTypeId');

  // Auto-fill other fields when selection changes
  useEffect(() => {
    const response = selectionQuery.data?.response;
    if (selectedId) {
      const selectedType = response?.find(
        (d) => d.debtPositionTypeId === Number(selectedId)
      );

      // If not editing, auto-fill fields with the selected debt type
      if (selectedType && !edit) {
        Object.entries(selectedType).forEach(([key, val]) => {
          setValue(key as keyof DebtTypeOrgForm, val);
        });
        trigger();
      }
    }
  }, [edit, selectedId, selectionQuery.data, setValue, trigger]);

  useEffect(() => {
    const response = detailQuery.data?.response;

    const areSelectsReady =
      !actualizationQuery.isLoading && !notificationQuery.isLoading;

    if (edit && response && areSelectsReady) {
      const formValues: Partial<DebtTypeOrgForm> = {};

      Object.entries(response).forEach(([key, val]) => {
        formValues[key as keyof DebtTypeOrgForm] = val;
      });

      formValues.flagNotifyOutcomePush = response.flagNotifyOutcomePush
        ? 'enabled'
        : 'disabled';

      reset({
        ...getValues(),
        ...formValues
      });
    }
  }, [
    edit,
    detailQuery.data,
    reset,
    getValues,
    actualizationQuery.isLoading,
    notificationQuery.isLoading
  ]);

  return (
    <WizardStepWrapper
      title={t('debtTypeOrgCreate.configuration.title')}
      subtitle={t('debtTypeOrgCreate.configuration.subtitle')}
      alertMessage={t('debtTypeOrgCreate.configuration.alertMessage')}
    >
      <SectionBox
        title={t('debtTypeOrgCreate.configuration.debtType.title')}
        adornment={<BookIcon />}
      >
        <FormComponent.ControlledSelect
          control={control}
          label={t('debtTypeOrgCreate.configuration.debtType.label')}
          name="debtPositionTypeId"
          disabled={!selectionQuery?.data?.optionsMap?.length || edit}
          options={selectionQuery?.data?.optionsMap}
          data-testId="debtPositionTypeId"
        />
      </SectionBox>

      <SectionBox
        title={t('debtTypeOrgCreate.configuration.debtTypeVersion.title')}
        subtitle={t('debtTypeOrgCreate.configuration.debtTypeVersion.subtitle')}
        adornment={<PostAddIcon />}
      >
        <Stack direction="row" spacing={3}>
          <FormComponent.ControlledTextField
            name="code"
            data-testId="code"
            sx={{ flex: 1 }}
            control={control}
            label={t('debtTypeOrgCreate.configuration.code.label')}
            disabled={edit}
            noAdornment
          />
          <Stack flex={3}>
            <FormComponent.ControlledTextField
              name="description"
              data-testId="description"
              control={control}
              disabled={edit}
              label={t('debtTypeOrgCreate.configuration.description.label')}
              adornment={`${description?.length || 0}/100`}
            />
            <Typography variant="caption" px={1.5}>
              {t('debtTypeOrgCreate.configuration.description.caption')}
            </Typography>
          </Stack>
        </Stack>
      </SectionBox>
    </WizardStepWrapper>
  );
};
