import { Grid, TextField, Typography, Box } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import WizardStepButtons from '../../../../../components/Wizard/WizardStepButtons';
import { OrganizationEditStep1Data } from '../../../../../models/OrganizationEditTypes';
import { isValidEmail } from '../../../../../utils/fieldValidation';
import { base64ToFile } from '../../../../../utils/filevalidation';
import { FormComponent } from '../../../../../components/FormComponent';
import { theme } from '@pagopa/mui-italia';

type Props = {
  data: OrganizationEditStep1Data;
  setData: (data: OrganizationEditStep1Data) => void;
  onNext: () => void;
  onBack: () => void;
};

type Step1FormValues = {
  orgName: string;
  orgFiscalCode: string;
  orgEmail: string;
  orgLogo: File | null;
};

const Step1AnagraficaEnte = ({ data, setData, onNext, onBack }: Props) => {
  const { t } = useTranslation();

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue
  } = useForm<Step1FormValues>({
    defaultValues: {
      orgName: data.orgName.value,
      orgFiscalCode: data.orgFiscalCode.value,
      orgEmail: data.orgEmail.value,
      orgLogo: null
    },
    mode: 'onSubmit'
  });

  // Prepopulate the fields when the API data arrives
  useEffect(() => {
    if (data.orgName.value) {
      setValue('orgName', data.orgName.value);
    }
    if (data.orgFiscalCode.value) {
      setValue('orgFiscalCode', data.orgFiscalCode.value);
    }
    if (data.orgEmail.value) {
      setValue('orgEmail', data.orgEmail.value);
    }

    // Convert the base64 logo to File object for the FileUploader
    if (data.orgLogo.value) {
      const file = base64ToFile(data.orgLogo.value);
      if (file) {
        setValue('orgLogo', file);
      }
    }
  }, [
    data.orgName.value,
    data.orgFiscalCode.value,
    data.orgEmail.value,
    data.orgLogo.value,
    setValue
  ]);

  const onSubmit = (values: Step1FormValues) => {
    setData({
      orgName: {
        value: values.orgName,
        readonly: data.orgName.readonly
      },
      orgFiscalCode: {
        value: values.orgFiscalCode,
        readonly: data.orgFiscalCode.readonly
      },
      orgEmail: {
        value: values.orgEmail,
        readonly: data.orgEmail.readonly
      },
      orgLogo: {
        value: values.orgLogo
          ? URL.createObjectURL(values.orgLogo)
          : data.orgLogo.value, // Keep the existing logo if no new file is uploaded
        readonly: data.orgLogo.readonly
      }
    });

    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid item xs={12} sx={{ mt: 4 }}>
        <Box
          borderRadius={2}
          bgcolor={theme.palette.background.paper}
          padding={4}
        >
          <Typography
            variant="h4"
            fontWeight={600}
            color="textPrimary"
            sx={{ mb: 2 }}
          >
            {t('organizationEditWizard.step1.title')}
          </Typography>
          <Typography
            variant="body2"
            color="error.main"
            sx={{ fontWeight: 600, marginBottom: 3 }}
          >
            {t('commons.requiredFieldDescription')}
          </Typography>

          <Grid container spacing={2}>
            {/* Organization name */}
            <Grid item xs={12}>
              <Controller
                name="orgName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('organizationEditWizard.step1.orgName.label')}
                    placeholder={t(
                      'organizationEditWizard.step1.orgName.placeholder'
                    )}
                    disabled={data.orgName.readonly || !!data.orgName.value}
                    error={!!errors.orgName}
                    helperText={errors.orgName?.message}
                    data-testid="org-name-field"
                  />
                )}
              />
            </Grid>

            {/* Fiscal code */}
            <Grid item xs={12}>
              <Controller
                name="orgFiscalCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t(
                      'organizationEditWizard.step1.orgFiscalCode.label'
                    )}
                    placeholder={t(
                      'organizationEditWizard.step1.orgFiscalCode.placeholder'
                    )}
                    disabled={
                      data.orgFiscalCode.readonly || !!data.orgFiscalCode.value
                    }
                    error={!!errors.orgFiscalCode}
                    helperText={errors.orgFiscalCode?.message}
                    data-testid="org-fiscal-code-field"
                  />
                )}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12}>
              <Controller
                name="orgEmail"
                control={control}
                rules={{
                  validate: {
                    validEmail: (value: string) => {
                      if (!value) return true;
                      return (
                        isValidEmail(value) ||
                        t('organizationEditWizard.step1.orgEmail.invalid')
                      );
                    }
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="email"
                    label={t('organizationEditWizard.step1.orgEmail.label')}
                    disabled={data.orgEmail.readonly}
                    error={!!errors.orgEmail}
                    helperText={
                      errors.orgEmail?.message ||
                      t('organizationEditWizard.step1.orgEmail.helperText')
                    }
                    data-testid="org-email-field"
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </Grid>

      {/* Logo Upload */}
      <Grid item xs={12} sx={{ mt: 4 }}>
        <Box
          borderRadius={2}
          bgcolor={theme.palette.background.paper}
          padding={4}
        >
          <Typography
            variant="body2"
            fontWeight={800}
            color="textPrimary"
            sx={{ mb: 1 }}
          >
            {t('organizationEditWizard.step1.orgLogo.title')}
            <Typography
              component="span"
              color="textSecondary"
              sx={{ ml: 1, fontWeight: 400 }}
            >
              - {t('organizationEditWizard.step1.orgLogo.optional')}
            </Typography>
          </Typography>

          <Typography variant="body2" color="textSecondary">
            {t('organizationEditWizard.step1.orgLogo.description')}
          </Typography>

          <FormComponent.ControlledFileUploader
            name="orgLogo"
            control={control}
            description={t(
              'organizationEditWizard.step1.orgLogo.uploadDescription'
            )}
            fileExtensionsAllowed={['png', 'jpg', 'jpeg', 'svg']}
            disabled={data.orgLogo.readonly}
            header={<></>}
          />

          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ mt: 1, display: 'flex', alignItems: 'center' }}
          >
            {t('organizationEditWizard.step1.orgLogo.requirements')}
            <Typography
              component="a"
              href="#"
              color="primary"
              onClick={(event) => {
                event.preventDefault();
                console.log(
                  'TODO: Handle "Learn more" action for logo requirements'
                );
              }}
              sx={{
                textDecoration: 'underline',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                ml: 0.5
              }}
            >
              {t('organizationEditWizard.step1.orgLogo.learnMore')}
              <Visibility sx={{ fontSize: 16 }} />
            </Typography>
          </Typography>
        </Box>
      </Grid>

      <WizardStepButtons
        onBack={onBack}
        onNext={handleSubmit(onSubmit)}
        disableNext={false}
        nextLabel="commons.continue"
        backLabel="commons.back"
      />
    </form>
  );
};

export default Step1AnagraficaEnte;
