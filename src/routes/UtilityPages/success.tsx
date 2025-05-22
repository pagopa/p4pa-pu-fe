import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { PageRoutes } from '../../App';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { theme } from '@pagopa/mui-italia';
import ThankYouPage from '../../components/ThankYouPage/ThankYouPage';
import { ThankyouPageConfig } from '../../models/ThankyouPage';
import { useEffect } from 'react';

export const SuccessPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const location = useLocation();
  const { i18nParams } = location?.state || {};

  const pageConfig =
    ThankyouPageConfig[category as keyof typeof ThankyouPageConfig];

  useEffect(() => {
    if (!pageConfig) {
      navigate(PageRoutes.HOME, { replace: true });
    }
  }, [pageConfig]);

  const buttonConfig = pageConfig?.buttonConfig?.map((btn) => {
    const handleClick = () => {
      navigate(PageRoutes[btn.actionID || PageRoutes.HOME]);
    };

    return {
      ...btn,
      buttonLabel: btn.buttonLabel ? t(btn.buttonLabel) : '',
      onButtonClick: handleClick
    };
  });

  return (
    <>
      <ThankYouPage
        icon={
          <CheckCircleOutlineOutlinedIcon
            sx={{ fontSize: 60, color: theme.palette.secondary.main }}
          />
        }
        title={String(t(pageConfig?.title, i18nParams))}
        description={t(pageConfig?.description)}
        buttonConfig={buttonConfig}
      />
    </>
  );
};

export default SuccessPage;
