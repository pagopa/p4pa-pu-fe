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

  return {
    createService,
    isLoading: createMutation.isPending,
    error,
    clearError: () => setError(null)
  };
};
