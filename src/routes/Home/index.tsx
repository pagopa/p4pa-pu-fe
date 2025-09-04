import { useEffect } from 'react';
import utils from '../../utils';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();
  useEffect(() => {
    const pendingNotification = sessionStorage.getItem('pendingNotification');
    if (pendingNotification) {
      const { message, type } = JSON.parse(pendingNotification);
      utils.notify.emit(message, type);
      sessionStorage.removeItem('pendingNotification');
    }
  }, []);

  return (
    <>
      <TitleComponent title={t('commons.routes.HOME')}></TitleComponent>
    </>
  );
};

export default Home;
