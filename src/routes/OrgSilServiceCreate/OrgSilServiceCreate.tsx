import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { Stack, Box, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { theme } from '@pagopa/mui-italia';
import { ArrowBack, LibraryAddCheck, MenuBook } from '@mui/icons-material';
import { orgSilServiceFormSchema, OrgSilServiceFormData } from './schema';
import { useOrgSilServiceForm } from './hooks/useOrgSilServiceForm';
import {
  SERVICE_TYPE_OPTIONS,
  LEGACY_OPTIONS
} from './utils/orgSilServiceFormUtils';
import { LegacyAuthConfiguration } from './components/LegacyAuthConfiguration';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import SectionBox from '../../components/Wizard/SectionBox';
import { FormComponent } from '../../components/FormComponent';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import { PageRoutes } from '..';
import { useConditionalReset } from './hooks/useConditionalReset';

export const OrgSilServiceCreate = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const { createService, isLoading } = useOrgSilServiceForm({
    organizationId: organizationId
  });

  const { control, handleSubmit, watch, resetField } =
    useForm<OrgSilServiceFormData>({
      resolver: zodResolver(orgSilServiceFormSchema),
      mode: 'onSubmit',
      reValidateMode: 'onChange',
      defaultValues: {
        applicationName: '',
        serviceUrl: '',
        serviceType: undefined,
        flagLegacy: false
      }
    });

  const { watchFlagLegacy, watchAuthConfigType } = useConditionalReset({
    watch,
    resetField
  });

  const onSubmit = (formData: OrgSilServiceFormData) => {
    createService(formData);
  };

  const handleCancel = () => {
    navigate(PageRoutes.ORG_SIL_SERVICE);
  };

  return (
    <Box sx={{ p: 3 }}>
      <TitleComponent
        title={t('orgSilServiceCreate.title')}
        description={t('orgSilServiceCreate.descriprion')}
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={3}>
          <Paper sx={{ p: 4, mt: 3 }}>
            <Typography variant="h6" color={theme.palette.text.primary} mb={2}>
              {t('orgSilServiceCreate.subTitle')}
            </Typography>
            <Typography variant="body2" color={theme.palette.error.dark} mb={4}>
              {t('commons.requiredFieldDescription')}
            </Typography>

            <SectionBox
              title={t('orgSilServiceCreate.generalConfiguration')}
              adornment={<MenuBook />}
            >
              <Stack spacing={3}>
                <FormComponent.ControlledTextField
                  name="applicationName"
                  control={control}
                  label={t('orgSilServiceCreate.APIName')}
                  required
                  noAdornment
                />
                <FormComponent.ControlledTextField
                  name="serviceUrl"
                  control={control}
                  label={t('orgSilServiceCreate.serviceURL')}
                  required
                  noAdornment
                />
                <FormComponent.ControlledSelect
                  name="serviceType"
                  control={control}
                  label={t('orgSilServiceCreate.serviceType')}
                  required
                  options={SERVICE_TYPE_OPTIONS.map((option) => ({
                    ...option,
                    label: t(option.label)
                  }))}
                />
              </Stack>
            </SectionBox>

            <SectionBox
              title={t('orgSilServiceCreate.authMethod')}
              adornment={<LibraryAddCheck />}
            >
              <Stack direction="column" gap={2} alignItems="left" width="100%">
                <Controller
                  name="flagLegacy"
                  control={control}
                  render={({ field }) => (
                    <FormComponent.ControlledRadioGroup
                      name="flagLegacy"
                      control={control}
                      label={t('orgSilServiceCreate.flagLegacy')}
                      required
                      value={String(field.value)}
                      sx={{ flexDirection: 'row' }}
                      options={LEGACY_OPTIONS.map((option) => ({
                        ...option,
                        label: t(option.label)
                      }))}
                      onChange={(event) => {
                        const boolValue = event.target.value === 'true';
                        field.onChange(boolValue);
                      }}
                    />
                  )}
                />

                {watchFlagLegacy && (
                  <LegacyAuthConfiguration
                    control={control}
                    authConfigType={watchAuthConfigType}
                    t={t}
                  />
                )}
              </Stack>
            </SectionBox>
          </Paper>

          <Stack
            display="flex"
            direction="row"
            spacing={2}
            justifyContent="space-between"
          >
            <Box>
              <FormComponent.Button
                data-testid="back-button"
                variant="outlined"
                onClick={handleCancel}
                startIcon={<ArrowBack />}
                label={t('commons.back')}
                size="large"
              />
            </Box>
            <Box>
              <FormComponent.Button
                type="submit"
                label={t('commons.add')}
                size="large"
                disabled={isLoading}
              />
            </Box>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
};
