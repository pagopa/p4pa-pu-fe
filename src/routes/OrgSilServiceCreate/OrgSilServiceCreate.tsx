import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useOrgSilServiceForm } from './hooks/useOrgSilServiceForm';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import { PageRoutes } from '..';
import { OrgSilServiceForm } from './components/OrgSilServiceForm';
import { OrgSilServiceFormData } from './schema';

export const OrgSilServiceCreate = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const { createService } = useOrgSilServiceForm({
    organizationId
  });

  const handleSubmit = (formData: OrgSilServiceFormData) => {
    createService(formData);
  };

  const handleCancel = () => {
    navigate(PageRoutes.ORG_SIL_SERVICE);
  };

  const config = {
    title: t('orgSilServiceCreate.title'),
    description: t('orgSilServiceCreate.description'),
    submitButtonLabel: t('commons.add'),
    serviceTypeDisabled: false
  };

  return (
    <OrgSilServiceForm
      config={config}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};
