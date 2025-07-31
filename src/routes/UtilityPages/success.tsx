import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, generatePath } from 'react-router';
import { PageRoutes } from '../../routes';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { theme } from '@pagopa/mui-italia';
import { SuccessPageConfig } from '../../models/SuccessPageConfig';
import { useEffect } from 'react';
import ResponsePage from '../../components/ResponsePage/ResponsePage';

export const SuccessPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { category } = location?.state || {};
  const { i18nParams } = location?.state || {};

  const pageConfig =
    SuccessPageConfig[category as keyof typeof SuccessPageConfig];

  useEffect(() => {
    if (!pageConfig) {
      navigate(PageRoutes.HOME, { replace: true });
    }
  }, [pageConfig]);

  const buttonConfig = pageConfig?.buttonConfig?.map((btn) => {
    const handleClick = () => {
      if (
        btn.customNavigation === 'ASSESSMENT_DETAIL' &&
        location?.state?.assessmentId
      ) {
        const detailPath = generatePath(PageRoutes.ASSESSMENT_DETAIL, {
          id: location.state.assessmentId.toString()
        });
        navigate(detailPath);
      } else {
        navigate(PageRoutes[btn.actionID || PageRoutes.HOME]);
      }
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
          <CheckCircleOutlineOutlinedIcon
            sx={{ fontSize: 60, color: theme.palette.secondary.main }}
          />
        }
        title={String(
          t(pageConfig?.title, {
            ...i18nParams,
            interpolation: { escapeValue: false }
          })
        )}
        description={pageConfig?.description ? t(pageConfig.description) : ''}
        buttonConfig={buttonConfig}
      />
    </>
  );
};

export default SuccessPage;
