import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, generatePath } from 'react-router';
import { PageRoutes } from '../../routes';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
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
  }, [pageConfig, navigate]);

  const buttonConfig = pageConfig?.buttonConfig?.map((btn) => {
    const handleClick = () => {
      if (
        btn.customNavigation === 'ASSESSMENT_DETAIL' &&
        location?.state?.assessmentId
      ) {
        const detailPath = generatePath(PageRoutes.ASSESSMENT_DETAIL, {
          id: location.state.assessmentId.toString()
        });
        navigate(detailPath, { replace: true, state: { fromSuccess: true } });
      } else if (
        btn.customNavigation === 'ORG_SIL_SERVICE_DETAIL' &&
        location?.state?.orgSilServiceId
      ) {
        const detailPath = generatePath(PageRoutes.ORG_SIL_SERVICE_DETAIL, {
          orgSilServiceId: location.state.orgSilServiceId.toString()
        });
        navigate(detailPath, { replace: true, state: { fromSuccess: true } });
      } else if (
        btn.customNavigation === 'CLIENT_SIL_DETAIL' &&
        location?.state?.clientId
      ) {
        const detailPath = generatePath(PageRoutes.CLIENT_SIL_DETAIL, {
          clientId: location.state.clientId.toString()
        });
        navigate(detailPath, { replace: true, state: { fromSuccess: true } });
      } else if (btn.customNavigation === 'OPERATORS_DETAIL') {
        const { organizationId, orgName, mappedExternalUserId } =
          location?.state || {};

        const detailPath = generatePath(PageRoutes.OPERATORS_DETAIL, {
          organizationId,
          orgName,
          mappedExternalUserId
        });
        navigate(detailPath, { replace: true, state: { fromSuccess: true } });
      } else if (
        btn.customNavigation === 'ASSESSMENT_REGISTRY_DETAIL' &&
        location?.state?.assessmentRegistryId
      ) {
        const detailPath = generatePath(PageRoutes.ASSESSMENT_REGISTRY_DETAIL, {
          assessmentRegistryId: location.state.assessmentRegistryId.toString()
        });
        navigate(detailPath, { replace: true, state: { fromSuccess: true } });
      } else {
        const to = PageRoutes[btn.actionID || PageRoutes.HOME];
        navigate(to);
      }
    };

    return {
      ...btn,
      buttonLabel: btn.buttonLabel ? t(btn.buttonLabel) : '',
      onButtonClick: handleClick
    };
  });

  const getIcon = () => {
    const isPartialSuccess = category === 'assessment-create-partial-success';

    if (isPartialSuccess) {
      return (
        <WarningAmberOutlinedIcon
          sx={{ fontSize: 60, color: theme.palette.warning.main }}
        />
      );
    }

    return (
      <CheckCircleOutlineOutlinedIcon
        sx={{ fontSize: 60, color: theme.palette.secondary.main }}
      />
    );
  };

  return (
    <ResponsePage
      icon={getIcon()}
      title={String(
        t(pageConfig?.title, {
          ...i18nParams,
          interpolation: { escapeValue: false }
        })
      )}
      description={
        pageConfig?.description
          ? String(t(pageConfig.description, i18nParams))
          : ''
      }
      buttonConfig={buttonConfig}
    />
  );
};

export default SuccessPage;
