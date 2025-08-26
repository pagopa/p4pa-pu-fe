import { useState } from 'react';
import { useNavigate } from 'react-router';
import { OrgSilServiceFormData } from '../schema';
import { transformFormDataToDTO } from '../utils/orgSilServiceFormUtils';
import orgSilService from '../../../api/orgSilService/index';
import { PageRoutes } from '../..';

type UseOrgSilServiceFormProps = {
  organizationId: number;
};

export const useOrgSilServiceForm = ({
  organizationId
}: UseOrgSilServiceFormProps) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const createMutation = orgSilService.createOrgSilService({
    organizationId
  });

  const updateMutation = orgSilService.updateOrgSilService({
    organizationId
  });

  const createService = async (
    formData: OrgSilServiceFormData
  ): Promise<void> => {
    setError(null);

    try {
      const dto = transformFormDataToDTO(formData, organizationId);
      const response = await createMutation.mutateAsync(dto);

      navigate(PageRoutes.RESPONSES_SUCCESS, {
        replace: true,
        state: {
          category: 'org-sil-service-create',
          i18nParams: { applicationName: response.applicationName },
          orgSilServiceId: response.orgSilServiceId
        }
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error during service creation';
      setError(errorMessage);

      navigate(PageRoutes.RESPONSES_ERROR, {
        replace: true,
        state: { errorType: 'default' }
      });
    }
  };

  const updateService = async (
    formData: OrgSilServiceFormData & { orgSilServiceId: number }
  ): Promise<void> => {
    setError(null);

    if (!updateMutation) {
      console.error('Update mutation not available');
      setError('Update functionality not available');
      return;
    }

    try {
      const dto = transformFormDataToDTO(formData, organizationId);
      dto.orgSilServiceId = formData.orgSilServiceId;

      const response = await updateMutation.mutateAsync(dto);

      navigate(PageRoutes.RESPONSES_SUCCESS, {
        replace: true,
        state: {
          category: 'org-sil-service-edit',
          i18nParams: { applicationName: response.applicationName },
          orgSilServiceId: response.orgSilServiceId
        }
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error during service update';
      setError(errorMessage);

      navigate(PageRoutes.RESPONSES_ERROR, {
        replace: true,
        state: { errorType: 'default' }
      });
    }
  };

  return {
    createService,
    updateService,
    isLoading: createMutation.isPending || (updateMutation?.isPending ?? false),
    error,
    clearError: () => setError(null)
  };
};
