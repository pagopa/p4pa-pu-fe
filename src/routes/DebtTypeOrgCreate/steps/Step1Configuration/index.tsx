import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import PostAddIcon from '@mui/icons-material/PostAdd';
import BookIcon from '@mui/icons-material/MenuBook';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import SectionBox from '../../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../../components/FormComponent';
import { useStore } from '../../../../store/GlobalStore';
import { useDebtPositionTypesByOrg } from '../../../../hooks/useDebtPositionTypesByOrg';
import { useEffect, useMemo } from 'react';
import { DebtTypeOrgForm } from '../../types';
import { useParams } from 'react-router';
import { getDebtPositionTypeOrgById } from '../../../../api/debtPositionsTypeOrg';
import {
  useActualizationServices,
  useNotificationServices
} from '../../hooks/useOrgSilServices';

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

  useActualizationServices();
  useNotificationServices();

  const { control, setValue, trigger } = useFormContext<DebtTypeOrgForm>();

  const description = useWatch({ control, name: 'description' });
  const selectedId = useWatch({ control, name: 'debtPositionTypeId' });

  const selectedTaxonomyCode = useMemo(() => {
    const response = selectionQuery.data?.response as Array<
      { debtPositionTypeId: number; taxonomyCode?: string } | undefined
    >;
    if (selectedId && response?.length) {
      const selectedType = response.find(
        (d) => d?.debtPositionTypeId === Number(selectedId)
      );
      if (selectedType?.taxonomyCode) {
        return selectedType.taxonomyCode;
      }
    }

    const detail = detailQuery.data?.response as
      | { taxonomyCode?: string }
      | undefined;
    return detail?.taxonomyCode || '';
  }, [detailQuery.data, selectedId, selectionQuery.data]);

  // Auto-fill other fields when selection changes
  useEffect(() => {
    const response = selectionQuery.data?.response;
    if (selectedId) {
      const selectedType = response?.find(
        (d) => d.debtPositionTypeId === Number(selectedId)
      );

      // If not editing, auto-fill fields with the selected debt type
      if (selectedType && !edit) {
        Object.entries(selectedType).forEach(([key, value]) => {
          const field = key as keyof DebtTypeOrgForm;
          // code should not be auto-filled
          if (field === 'code') return;

          if (field === 'debtPositionTypeId') return;
          setValue(field, value);
        });
      }
    }
  }, [edit, selectedId, selectionQuery.data, setValue, trigger]);

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
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Stack sx={{ flex: 1, minWidth: 0 }}>
            <FormComponent.ControlledSelect
              control={control}
              label={t('debtTypeOrgCreate.configuration.debtType.label')}
              name="debtPositionTypeId"
              disabled={!selectionQuery?.data?.optionsMap?.length || edit}
              options={selectionQuery?.data?.optionsMap}
              data-testid="debtPositionTypeId"
              sx={{ flex: 1, minWidth: 0 }}
              required
            />
          </Stack>
          <Stack sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              label={t('debtTypeOrgCreate.configuration.taxonomyCode.label')}
              value={selectedTaxonomyCode || ''}
              placeholder={t(
                'debtTypeOrgCreate.configuration.taxonomyCode.placeholder'
              )}
              InputProps={{ readOnly: true }}
              disabled
              fullWidth
              size="small"
              helperText={
                selectedTaxonomyCode
                  ? t('debtTypeOrgCreate.configuration.taxonomyCode.helper')
                  : undefined
              }
              data-testid="taxonomyCode"
            />
          </Stack>
        </Stack>
      </SectionBox>

      <SectionBox
        title={t('debtTypeOrgCreate.configuration.debtTypeVersion.title')}
        subtitle={t('debtTypeOrgCreate.configuration.debtTypeVersion.subtitle')}
        adornment={<PostAddIcon />}
      >
        <Stack direction="row" spacing={3}>
          <FormComponent.ControlledTextField
            name="code"
            data-testid="code"
            sx={{ flex: 1 }}
            control={control}
            label={t('debtTypeOrgCreate.configuration.code.label')}
            disabled={edit}
            inputProps={{ maxLength: 255 }}
            noAdornment
            required
          />
          <Stack flex={3}>
            <FormComponent.ControlledTextField
              name="description"
              data-testid="description"
              control={control}
              disabled={edit}
              label={t('debtTypeOrgCreate.configuration.description.label')}
              inputProps={{ maxLength: 200 }}
              adornment={`${description?.length || 0}/200`}
              required
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
