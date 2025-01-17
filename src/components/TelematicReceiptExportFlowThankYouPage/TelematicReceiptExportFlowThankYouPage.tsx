import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../routes/routes';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ThankYouPage from '../ThankYouPage/ThankYouPage';

export const TelematicReceiptExportFlowThankYouPage = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate(PageRoutes.TELEMATIC_RECEIPT_EXPORT_OVERVIEW);
  };

  return (
    <>
      <ThankYouPage 
        icon={<CheckCircleOutlineOutlinedIcon sx={{fontSize: 60, color: theme.palette.secondary.main}} />}
        title={t('telematicReceiptExportFlowThankYouPage.title')}
        description={t('telematicReceiptExportFlowThankYouPage.description')}
        buttonLabel={t('telematicReceiptExportFlowThankYouPage.closeButton')}
        onButtonClick={handleButtonClick}
      />
    </>
  );
};

export default TelematicReceiptExportFlowThankYouPage;