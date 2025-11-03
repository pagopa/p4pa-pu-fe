import Loader from '../../../../components/Loader/Loader';
import { useTranslation } from 'react-i18next';

function Step1Loading() {
  const { t } = useTranslation();

  return (
    <Loader
      title={t('debtPositionCreateWizard.generalConfiguration.title')}
      subtitle={t('debtPositionCreateWizard.generalConfiguration.subtitle')}
      messageKey="debtPositionCreateWizard.loadingDebtPosition"
      data-testid="step1-loading"
    />
  );
}

export default Step1Loading;
