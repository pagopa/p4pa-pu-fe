import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, generatePath } from 'react-router';
import { PageRoutes } from '../../../routes';
import { useStore } from '../../../store/GlobalStore';
import { getOrganizationDetail } from '../../../api/organizations';
import { OrganizationDetailDTO } from '../../../../generated/data-contracts';
import { UnifiedFormData } from '../../../models/OrganizationEditTypes';
import { transformApiDataToFormData } from '../../../utils/organizationFormTransformers';
import { OrganizationEditForm } from './components/OrganizationEditForm';
import utils from '../../../utils';

const OrganizationEditWizard = () => {
  const [formData, setFormData] = useState<UnifiedFormData | null>(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const organizationDetailDataRef = useRef<OrganizationDetailDTO | null>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { organizationId: organizationIdByURL } = useParams<{
    organizationId: string;
  }>();

  const {
    state: { organizationId }
  } = useStore();

  const getOrganizationId = !isNaN(Number(organizationIdByURL))
    ? Number(organizationIdByURL)
    : organizationId;

  const {
    isError,
    isSuccess,
    isLoading,
    data: organizationDetailData
  } = getOrganizationDetail(getOrganizationId);

  useEffect(() => {
    if (isError) {
      // If there is an error loading, go back to the detail page
      utils.notify.emit(t('organizationEditWizard.errorLoadingData'), 'error');
      navigate(
        generatePath(PageRoutes.ORGANIZATIONS_DETAIL, {
          organizationId: getOrganizationId
        })
      );
      return;
    }

    if (isSuccess && organizationDetailData && !isDataReady) {
      // Fill form with existing organization data using utility function
      const transformedData = transformApiDataToFormData(
        organizationDetailData
      );
      setFormData(transformedData);
      // Store original data for PUT request
      organizationDetailDataRef.current = organizationDetailData;
      setIsDataReady(true);
    }
  }, [
    isError,
    isSuccess,
    organizationDetailData,
    navigate,
    getOrganizationId,
    isDataReady,
    t
  ]);

  // Don't render anything until the data is ready
  if (
    isLoading ||
    !isDataReady ||
    !formData ||
    !organizationDetailDataRef.current
  ) {
    return null;
  }

  return (
    <OrganizationEditForm
      formData={formData}
      organizationId={getOrganizationId}
      originalData={organizationDetailDataRef.current}
    />
  );
};

export default OrganizationEditWizard;
