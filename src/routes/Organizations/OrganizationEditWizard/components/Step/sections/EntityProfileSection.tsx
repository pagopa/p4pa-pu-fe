/**
 * Entity Profile Section Component
 * Displays organization profile fields: name, fiscal code, email, and logo
 * Extracted from Step1EntityProfile for reuse in unified form
 */

import { Box, Grid, TextField, Typography } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import {
  UnifiedFormData,
  UnifiedFormValues
} from '../../../../../../models/OrganizationEditTypes';
import { isValidEmail } from '../../../../../../utils/fieldValidation';
import { FormComponent } from '../../../../../../components/FormComponent';
import { theme } from '@pagopa/mui-italia';

type EntityProfileSectionProps = {
  control: Control<UnifiedFormValues>;
  errors: FieldErrors<UnifiedFormValues>;
  data: UnifiedFormData;
  t: (key: string) => string;
};

/**
 * Entity Profile Section Component
 * Renders organization profile fields in a unified form
 *
 * @param props - Component props
 * @param props.control - React Hook Form control instance
 * @param props.errors - React Hook Form field errors
 * @param props.data - Unified form data containing field values and readonly status
 * @param props.t - Translation function
 * @returns JSX element containing entity profile fields
 */
export const EntityProfileSection = ({
  control,
  errors,
  data,
  t
}: EntityProfileSectionProps) => {
  return (
    <>
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

          <Grid container spacing={2}>
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

          <Box sx={{ mt: 4 }}>
            <Typography
              variant="body2"
              fontWeight={800}
              color="textPrimary"
              sx={{ mb: 1 }}
            >
              {t('organizationEditWizard.step1.orgLogo.title')}
            </Typography>

            <Typography variant="body2" color="textSecondary">
              {t('organizationEditWizard.step1.orgLogo.description')}
            </Typography>

            <Controller
              name="orgLogo"
              control={control}
              rules={{
                validate: (value: File | null) => {
                  const logoWasRemoved =
                    data.orgLogo.value !== null && value === null;
                  const hasLogo =
                    value !== null ||
                    (data.orgLogo.value !== null && !logoWasRemoved);
                  if (!hasLogo) {
                    return t('organizationEditWizard.step1.orgLogo.required');
                  }
                  if (logoWasRemoved) {
                    return t('organizationEditWizard.step1.orgLogo.required');
                  }
                  return true;
                }
              }}
              render={() => (
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
              )}
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
        </Box>
      </Grid>
    </>
  );
};
