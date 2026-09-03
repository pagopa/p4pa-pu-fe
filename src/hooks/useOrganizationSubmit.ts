/**
 * Custom hook for managing Organization form submission
 * Encapsulates submit logic, API calls, notifications, and navigation
 */

import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router';
import { updateOrganization } from '../api/organizations';
import {
  OrganizationDetailDTO,
  OrganizationStatus
} from '../../generated/core/data-contracts';
import { UnifiedFormData } from '../models/OrganizationEditTypes';
import { PageRoutes } from '../routes';
import utils from '../utils';
import { transformFormDataToApiPayload } from '../utils/organizationFormTransformers';

type UseOrganizationSubmitParams = {
  organizationId: number;
  originalData: OrganizationDetailDTO;
  onSuccess?: () => void;
};

type UseOrganizationSubmitReturn = {
  submit: (formData: UnifiedFormData, enableOrg: boolean) => Promise<void>;
  isSubmitting: boolean;
};

/**
 * Hook for managing Organization form submission
 *
 * @param params - Hook parameters
 * @param params.organizationId - Organization ID
 * @param params.originalData - Original organization data from API
 * @param params.onSuccess - Optional success callback
 * @returns Submit function and loading state
 */
export const useOrganizationSubmit = ({
  organizationId,
  originalData,
  onSuccess
}: UseOrganizationSubmitParams): UseOrganizationSubmitReturn => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Setup mutation for updating organization
  const update = updateOrganization();

  /**
   * Submits the organization form data
   * Transforms form data to API payload and calls update mutation
   *
   * @param formData - Unified form data from the form
   * @param enableOrg - Whether to enable/activate the organization
   * @returns Promise that resolves when submission is complete
   */
  const submit = async (
    formData: UnifiedFormData,
    enableOrg: boolean
  ): Promise<void> => {
    try {
      // Transform form data to API payload format
      const payload = transformFormDataToApiPayload(formData, originalData);

      // Handle enableOrg logic - validate and activate organization if requested
      if (enableOrg) {
        // Check mandatory fields for activation
        // Required fields: iban, orgLogo, segregationCode
        const mandatoryFieldsFilled =
          payload.iban && payload.orgLogo && payload.segregationCode;

        if (mandatoryFieldsFilled) {
          // All required fields are present, activate the organization
          payload.status = OrganizationStatus.ACTIVE;
        } else {
          console.error('Missed required fields to activate');
        }
      }

      // Call API to update organization
      await update.mutateAsync({
        organizationId,
        organizationData: payload
      });

      const organizationName = payload.orgName || originalData.orgName;

      // Pre-calculate navigation scenarios
      const isDraftSave =
        payload.status === OrganizationStatus.DRAFT && !enableOrg;
      const isEnableSuccess =
        payload.status === OrganizationStatus.ACTIVE && enableOrg;
      const isUpdateActive =
        payload.status === OrganizationStatus.ACTIVE && !enableOrg;

      if (payload.status === OrganizationStatus.DRAFT && enableOrg) {
        // Tried to enable but missing required fields - saved in draft
        utils.notify.emit(
          t('organizationEditWizard.successMessageNotEnable'),
          'warning'
        );
      } else if (!isDraftSave && !isEnableSuccess && !isUpdateActive) {
        // Successfully saved (and possibly activated)
        utils.notify.emit(
          t('organizationEditWizard.successMessage'),
          'success'
        );
      }

      // Navigate to appropriate page after successful submission
      if (isDraftSave) {
        // Saved in draft: show dedicated success page
        navigate(PageRoutes.RESPONSES_SUCCESS, {
          state: {
            category: 'organization-draft-saved',
            i18nParams: { orgName: organizationName },
            organizationId
          }
        });
      } else if (isEnableSuccess) {
        // Organization enabled: show dedicated success page
        navigate(PageRoutes.RESPONSES_SUCCESS, {
          state: {
            category: 'organization-enabled',
            i18nParams: { orgName: organizationName },
            organizationId
          }
        });
      } else if (isUpdateActive) {
        // Updates on active organization: show dedicated success page
        navigate(PageRoutes.RESPONSES_SUCCESS, {
          state: {
            category: 'organization-updated',
            i18nParams: { orgName: organizationName },
            organizationId
          }
        });
      } else {
        // In other cases continue to navigate to the organization detail
        navigate(
          generatePath(PageRoutes.ORGANIZATIONS_DETAIL, {
            organizationId: organizationId.toString()
          })
        );
      }

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting organization form:', error);
      utils.notify.emit(t('errors.generic'), 'error');
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  };

  return {
    submit,
    isSubmitting: update.isPending
  };
};
