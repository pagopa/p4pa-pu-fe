/**
 * Organization Edit Form Component
 * Unified form for editing organization details (replaces two-step wizard)
 */

import { Box, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { theme } from '@pagopa/mui-italia';
import { generatePath, useNavigate } from 'react-router';
import TitleComponent from '../../../../components/TitleComponent/TitleComponent';
import { UnifiedFormData } from '../../../../models/OrganizationEditTypes';
import { OrganizationDetailDTO } from '../../../../../generated/core/data-contracts';
import { PageRoutes } from '../../../../routes';
import {
  transformFormValuesToFieldData,
  handleLogoConversion
} from '../../../../utils/organizationFormTransformers';
import {
  createIBANValidationRules,
  validateLogoBeforeSubmit
} from '../../../../utils/validationRules';
import { useOrganizationEditForm } from '../../../../hooks/useOrganizationEditForm';
import { useOrganizationSubmit } from '../../../../hooks/useOrganizationSubmit';
import { EntityProfileSection } from './Step/sections/EntityProfileSection';
import { AccountingInfoSection } from './Step/sections/AccountingInfoSection';
import { PaymentsInfoSection } from './Step/sections/PaymentsInfoSection';
import { PagoPAIntegrationSection } from './Step/sections/PagoPAIntegrationSection';
import { FormActionButtons } from './FormActionButtons';

type OrganizationEditFormProps = {
  formData: UnifiedFormData;
  organizationId: number;
  originalData: OrganizationDetailDTO;
};

/**
 * Organization Edit Form Component
 * Renders unified form for editing organization details
 *
 * @param props - Component props
 * @param props.formData - Unified form data containing all field values and readonly status
 * @param props.organizationName - Optional organization name for title
 * @returns JSX element containing the unified edit form
 */
export const OrganizationEditForm = ({
  formData,
  organizationId,
  originalData
}: OrganizationEditFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    errors,
    watchAdditionalLanguage,
    watchFlagNotifyIo,
    setError,
    trigger
  } = useOrganizationEditForm({
    initialData: formData
  });

  const { submit, isSubmitting } = useOrganizationSubmit({
    organizationId,
    originalData
  });

  const isDraft = formData.organizationStatus === 'DRAFT';

  const title = isDraft
    ? t('organizationEditWizard.titleCreate')
    : t('organizationEditWizard.titleEdit');

  const description = isDraft
    ? t('organizationEditWizard.descriptionCreate')
    : t('organizationEditWizard.descriptionEdit');

  // Handler for form submit - prevents default form submission
  // Actual submission is handled by FormActionButtons handlers (handleSaveDraft, handleEnableOrg)
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleGoBack = () => {
    navigate(
      generatePath(PageRoutes.ORGANIZATIONS_DETAIL, {
        organizationId: organizationId.toString()
      })
    );
  };

  // Handler for save draft - saves organization without activating
  const handleSaveDraft = handleSubmit(async (formValues) => {
    // Validate logo before conversion using shared validation function
    const existingLogo = formData.orgLogo.value;
    const logoFile = formValues.orgLogo;
    const logoValidation = validateLogoBeforeSubmit(
      logoFile,
      existingLogo,
      formData.organizationStatus,
      t
    );

    // If logo validation fails, prevent submission
    if (logoValidation.shouldPreventSubmit) {
      // Set error on orgLogo field to show validation message
      setError('orgLogo', {
        type: 'manual',
        message:
          logoValidation.errorMessage ||
          t('organizationEditWizard.step1.orgLogo.required')
      });
      // Trigger validation to ensure error is shown and prevent submission
      await trigger('orgLogo');
      return;
    }

    // Handle logo conversion: convert File to base64 if logo was changed
    const logoConversion = await handleLogoConversion(logoFile, existingLogo);

    // Transform form values to unified form data structure
    const unifiedFormData = transformFormValuesToFieldData(
      formValues,
      formData
    );
    // Update unified form data with converted logo
    unifiedFormData.orgLogo = {
      value: logoConversion.logoValue,
      readonly: formData.orgLogo.readonly
    };
    unifiedFormData.logoRemoved = logoConversion.logoRemoved;
    await submit(unifiedFormData, false);
  });

  // Handler for submit/enable - saves and optionally activates organization
  const handleEnableOrg = handleSubmit(async (formValues) => {
    // Validate logo before conversion using shared validation function
    const existingLogo = formData.orgLogo.value;
    const logoFile = formValues.orgLogo;
    const logoValidation = validateLogoBeforeSubmit(
      logoFile,
      existingLogo,
      formData.organizationStatus,
      t
    );

    // If logo validation fails, prevent submission
    if (logoValidation.shouldPreventSubmit) {
      // Set error on orgLogo field to show validation message
      setError('orgLogo', {
        type: 'manual',
        message:
          logoValidation.errorMessage ||
          t('organizationEditWizard.step1.orgLogo.required')
      });
      // Trigger validation to ensure error is shown and prevent submission
      await trigger('orgLogo');
      return;
    }

    const logoConversion = await handleLogoConversion(logoFile, existingLogo);

    // Transform form values to unified form data structure
    const unifiedFormData = transformFormValuesToFieldData(
      formValues,
      formData
    );
    unifiedFormData.orgLogo = {
      value: logoConversion.logoValue,
      readonly: formData.orgLogo.readonly
    };
    unifiedFormData.logoRemoved = logoConversion.logoRemoved;
    await submit(unifiedFormData, isDraft);
  });

  return (
    <>
      <TitleComponent title={title} description={description} />

      <Typography variant="body2" color="error.main" sx={{ marginBottom: 3 }}>
        {t('commons.requiredFieldDescription')}
      </Typography>
      <form onSubmit={handleFormSubmit}>
        <Grid container spacing={2}>
          <EntityProfileSection
            control={control}
            errors={errors}
            data={formData}
            t={t}
          />
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
                {t('organizationEditWizard.step2.label')}
              </Typography>
              <AccountingInfoSection
                control={control}
                errors={errors}
                data={formData}
                t={t}
                createIBANValidationRules={createIBANValidationRules}
              />
              <PaymentsInfoSection
                control={control}
                errors={errors}
                data={formData}
                t={t}
                watchAdditionalLanguage={watchAdditionalLanguage}
              />
              <PagoPAIntegrationSection
                control={control}
                errors={errors}
                data={formData}
                t={t}
                watchFlagNotifyIo={watchFlagNotifyIo}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <FormActionButtons
              onBack={handleGoBack}
              onSubmit={handleEnableOrg}
              onSaveDraft={handleSaveDraft}
              showSaveDraft={isDraft}
              submitLabel={
                isDraft
                  ? 'organizationEditWizard.enableOrg'
                  : 'organizationEditWizard.saveChanges'
              }
              isSubmitting={isSubmitting}
            />
          </Grid>
        </Grid>
      </form>
    </>
  );
};
