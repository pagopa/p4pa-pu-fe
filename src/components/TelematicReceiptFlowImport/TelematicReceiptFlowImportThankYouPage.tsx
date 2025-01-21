import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../routes/routes';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ThankYouPage from '../ThankYouPage/ThankYouPage';
import { theme } from '@pagopa/mui-italia';

export const TelematicReceiptFlowImportThankYouPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate(PageRoutes.TELEMATIC_RECEIPT);
  };

  return (
    <>
      <ThankYouPage 
        icon={<CheckCircleOutlineOutlinedIcon sx={{fontSize: 60, color: theme.palette.secondary.main}} />}
        title={t('telematicReceiptFlowImportThankYouPage.title')}
        description={t('telematicReceiptFlowImportThankYouPage.description')}
        buttonLabel={t('telematicReceiptFlowImportThankYouPage.closeButton')}
        onButtonClick={handleButtonClick}
      />
    </>
  );
};

export default TelematicReceiptFlowImportThankYouPage;
