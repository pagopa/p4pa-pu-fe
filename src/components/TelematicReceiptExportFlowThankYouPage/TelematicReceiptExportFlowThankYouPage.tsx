import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../App';
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
        title={t('commons.successExport')}
        description={t('telematicReceiptExportFlowThankYouPage.description')}
        buttonLabel={t('commons.close')}
        onButtonClick={handleButtonClick}
      />
    </>
  );
};

export default TelematicReceiptExportFlowThankYouPage;
