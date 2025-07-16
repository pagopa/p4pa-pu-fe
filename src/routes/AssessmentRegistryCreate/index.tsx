import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../../routes';
import { Step1Configuration } from './steps/Step1Configuration';
import WizardStepButtons from '../../components/Wizard/WizardStepButtons';

export const AssessmentRegistryCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const submit = async () => {
    try {
      navigate(PageRoutes.RESPONSES_SUCCESS, {
        replace: true,
        state: {
          category: 'debt-type-catalog-create'
        }
      });
    } catch (error) {
      console.error(error);
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  };

  return (
    <form aria-label={t('debtTypeOrgCreate.formLabel')} role="form" noValidate>
      <Step1Configuration key="step1" />

      <WizardStepButtons onBack={() => navigate(-1)} onNext={submit} />
    </form>
  );
};
