import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageRoutes } from '../../App';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { theme } from '@pagopa/mui-italia';
import { useEffect } from 'react';
import ResponsePage from '../../components/ResponsePage/ResponsePage';
import { ErrorPageConfig } from '../../models/ErrorPageConfig';

export const GenericErrorPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { errorType } = location?.state || {};
  const { i18nParams } = location?.state || {};

  const pageConfig =
    ErrorPageConfig[errorType as keyof typeof ErrorPageConfig] ||
    ErrorPageConfig['default'];

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
      <ResponsePage
        icon={
          <ErrorOutlineOutlinedIcon
            sx={{ fontSize: 60, color: theme.palette.error.dark }}
          />
        }
        title={String(
          t(pageConfig?.title, {
            ...i18nParams,
            interpolation: { escapeValue: false }
          })
        )}
        description={t(pageConfig?.description)}
        buttonConfig={buttonConfig}
      />
    </>
  );
};

export default GenericErrorPage;
