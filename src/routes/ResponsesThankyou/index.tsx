import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageRoutes } from '../../App';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { theme } from '@pagopa/mui-italia';
import ThankYouPage from '../../components/ThankYouPage/ThankYouPage';
import { ThankyouPageConfig } from '../../models/ThankyouPage';

export const ResponsesThankyou = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { category } = useParams<{category: string}>();

  const pageConfig = ThankyouPageConfig[category as keyof typeof ThankyouPageConfig] || ThankyouPageConfig['default'];

  const handleButtonClick = () => {
    navigate(PageRoutes[pageConfig.routeID]);
  };

  return (
    <>
      <ThankYouPage 
        icon={<CheckCircleOutlineOutlinedIcon sx={{fontSize: 60, color: theme.palette.secondary.main}} />}
        title={t(pageConfig.title)}
        description={t(pageConfig.description)}
        buttonLabel={t('commons.close')}
        onButtonClick={handleButtonClick}
      />
    </>
  );
};

export default ResponsesThankyou;
