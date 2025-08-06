import { useEffect } from 'react';
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
  OrgSilServiceType,
  JwtAlgorithm
} from '../../../generated/data-contracts';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import SectionBox from '../../components/Wizard/SectionBox';
import { FormComponent } from '../../components/FormComponent';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import { PageRoutes } from '..';

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
        flagLegacy: false,
        authConfigType: undefined,
        basicUser: '',
        basicPassword: '',
        basicAuthURL: '',
        jwtKid: '',
        jwtIssuer: '',
        jwtSubject: '',
        jwtAlgorithm: undefined,
        jwtSigningKey: ''
      }
    });

  const watchFlagLegacy = watch('flagLegacy');
  const watchAuthConfigType = watch('authConfigType');

  useEffect(() => {
    if (!watchFlagLegacy) {
      resetField('authConfigType');
      resetField('basicUser');
      resetField('basicPassword');
      resetField('basicAuthURL');
      resetField('jwtKid');
      resetField('jwtIssuer');
      resetField('jwtSubject');
      resetField('jwtAlgorithm');
      resetField('jwtSigningKey');
    }
  }, [watchFlagLegacy, resetField]);

  useEffect(() => {
    if (watchAuthConfigType === 'basic') {
      resetField('jwtKid');
      resetField('jwtIssuer');
      resetField('jwtSubject');
      resetField('jwtAlgorithm');
      resetField('jwtSigningKey');
    } else if (watchAuthConfigType === 'jwt') {
      resetField('basicUser');
      resetField('basicPassword');
      resetField('basicAuthURL');
    } else {
      resetField('basicUser');
      resetField('basicPassword');
      resetField('basicAuthURL');
      resetField('jwtKid');
      resetField('jwtIssuer');
      resetField('jwtSubject');
      resetField('jwtAlgorithm');
      resetField('jwtSigningKey');
    }
  }, [watchAuthConfigType, resetField]);

  const onSubmit = (formData: OrgSilServiceFormData) => {
    createService(formData);
  };

  const handleCancel = () => {
    navigate(PageRoutes.ORG_SIL_SERVICE);
  };

  const serviceTypeOptions = [
    {
      value: OrgSilServiceType.ACTUALIZATION,
      label: t('orgSilServiceCreate.actualization')
    },
    {
      value: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME,
      label: t('orgSilServiceCreate.notice')
    }
  ];
  const authConfigOptions = [
    { value: 'basic', label: t('orgSilServiceCreate.legacyBasic') },
    { value: 'jwt', label: t('orgSilServiceCreate.legacyJWT') }
  ];
  const jwtAlgorithmOptions = Object.values(JwtAlgorithm).map((algo) => ({
    value: algo,
    label: algo
  }));

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
                  options={serviceTypeOptions}
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
                      options={[
                        { value: 'true', label: t('commons.yes') },
                        { value: 'false', label: t('commons.no') }
                      ]}
                      onChange={(event) => {
                        const boolValue = event.target.value === 'true';
                        field.onChange(boolValue);
                      }}
                    />
                  )}
                />
                {watchFlagLegacy && (
                  <Stack spacing={3}>
                    <FormComponent.ControlledSelect
                      name="authConfigType"
                      control={control}
                      label={t('orgSilServiceCreate.authConfig')}
                      required
                      options={authConfigOptions}
                    />
                    {watchAuthConfigType === 'basic' && (
                      <Stack spacing={3}>
                        <FormComponent.ControlledTextField
                          name="basicUser"
                          control={control}
                          label={t('orgSilServiceCreate.basicUser')}
                          required
                          noAdornment
                        />
                        <FormComponent.ControlledTextField
                          name="basicPassword"
                          control={control}
                          label={t('orgSilServiceCreate.basicPassword')}
                          required
                          noAdornment
                        />
                        <FormComponent.ControlledTextField
                          name="basicAuthURL"
                          control={control}
                          label={t('orgSilServiceCreate.basicAuthURL')}
                          required
                          placeholder="https://auth.example.com"
                          noAdornment
                        />
                      </Stack>
                    )}
                    {watchAuthConfigType === 'jwt' && (
                      <Stack spacing={3}>
                        <FormComponent.ControlledTextField
                          name="jwtKid"
                          control={control}
                          label={t('orgSilServiceCreate.jwtKid')}
                          required
                          noAdornment
                        />
                        <FormComponent.ControlledTextField
                          name="jwtIssuer"
                          control={control}
                          label={t('orgSilServiceCreate.jwtIssuer')}
                          required
                          noAdornment
                        />
                        <FormComponent.ControlledTextField
                          name="jwtSubject"
                          control={control}
                          label="Subject"
                          required
                          noAdornment
                        />
                        <FormComponent.ControlledSelect
                          name="jwtAlgorithm"
                          control={control}
                          label={t('orgSilServiceCreate.jwtAlgorithm')}
                          required
                          options={jwtAlgorithmOptions}
                        />
                        <FormComponent.ControlledTextField
                          name="jwtSigningKey"
                          control={control}
                          label={t('orgSilServiceCreate.jwtSigningKey')}
                          required
                          noAdornment
                        />
                      </Stack>
                    )}
                  </Stack>
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
