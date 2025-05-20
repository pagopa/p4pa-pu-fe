import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageRoutes } from '../../App';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { theme } from '@pagopa/mui-italia';
import ThankYouPage from '../../components/ThankYouPage/ThankYouPage';
import { DebtPositionType } from '../../../generated/data-contracts';

export const DebtTypeOrgCreateSuccess = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const formData = location.state?.formData as DebtPositionType;

  const handleButtonClick = () => {
    navigate(PageRoutes.DEBT_TYPES_CREATED);
  };

  return (
    <>
      <ThankYouPage
        icon={
          <CheckCircleOutlineOutlinedIcon
            sx={{ fontSize: 60, color: theme.palette.secondary.main }}
          />
        }
        title={t('debtTypeOrgCreate.success.title', {
          paymentObject: formData.description
        })}
        description={t('debtTypeOrgCreate.success.description')}
        buttonLabel={t('commons.backToStart')}
        onButtonClick={handleButtonClick}
      />
    </>
  );
};
