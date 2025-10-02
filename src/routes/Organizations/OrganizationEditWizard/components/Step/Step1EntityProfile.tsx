import { Grid, TextField, Typography, Box } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import WizardStepButtons from '../../../../../components/Wizard/WizardStepButtons';
import {
  OrganizationEditStep1Data,
  Step1FormValues
} from '../../../../../models/OrganizationEditTypes';
import { isValidEmail } from '../../../../../utils/fieldValidation';
import {
  base64ToFile,
  fileToBase64
} from '../../../../../utils/filevalidation';
import { FormComponent } from '../../../../../components/FormComponent';
import { theme } from '@pagopa/mui-italia';

type Props = {
  data: OrganizationEditStep1Data;
  setData: (data: OrganizationEditStep1Data) => void;
  onNext: () => void;
  onBack: () => void;
};

const Step1EntityProfile = ({ data, setData, onNext, onBack }: Props) => {
  const { t } = useTranslation();

  // Convert logo from base64 to File only once using useMemo
  const logoFile = useMemo(() => {
    if (data.orgLogo.value) {
      return base64ToFile(data.orgLogo.value);
    }
    return null;
  }, [data.orgLogo.value]);

  // Calculate initial values dynamically to prevent rendering with empty data
  const getInitialValues = (): Step1FormValues => {
    return {
      orgName: data.orgName.value || '',
      orgFiscalCode: data.orgFiscalCode.value || '',
      orgEmail: data.orgEmail.value || '',
      orgLogo: logoFile
    };
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    setError
  } = useForm<Step1FormValues>({
    defaultValues: getInitialValues(),
    values: getInitialValues(), // This ensures form updates when data changes
    mode: 'onSubmit'
  });

  const onSubmit = async (values: Step1FormValues) => {
    let logoValue = data.orgLogo.value; // Keep existing logo by default
    let logoRemoved = false;

    // Check if user has explicitly removed the logo
    if (data.orgLogo.value && !values.orgLogo) {
      // User had a logo before and now it's null = logo was removed
      logoValue = null;
      logoRemoved = true;

      // Validate: If status is ACTIVE and logo is removed, show error
      if (data.organizationStatus === 'ACTIVE') {
        // Set error on orgLogo field
        setError('orgLogo', {
          type: 'manual',
          message: t('organizationEditWizard.step1.orgLogo.required')
        });
        return;
      }
    } else if (values.orgLogo) {
      // If a new logo file is uploaded, convert it to base64
      try {
        logoValue = await fileToBase64(values.orgLogo);
        logoRemoved = false;
      } catch (error) {
        console.error('Error converting logo to base64:', error);
      }
    } else {
      // Validate: If status is ACTIVE and no logo exists at all
      if (data.organizationStatus === 'ACTIVE' && !data.orgLogo.value) {
        setError('orgLogo', {
          type: 'manual',
          message: t('organizationEditWizard.step1.orgLogo.required')
        });
        return;
      }
    }

    const step1Data = {
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
        value: logoValue,
        readonly: data.orgLogo.readonly
      },
      logoRemoved,
      organizationStatus: data.organizationStatus
    };

    setData(step1Data);
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
                    disabled={true}
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

export default Step1EntityProfile;
