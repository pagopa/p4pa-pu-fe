import { Box, Grid, Typography, Alert } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import TitleComponent, {
  ActionMenuItem
} from '../../components/TitleComponent/TitleComponent';
import { useNavigate, useParams, generatePath } from 'react-router';
import { useStore } from '../../store/GlobalStore';
import {
  getOrganizationDetail,
  updateOrganization
} from '../../api/organizations';
import { useEffect, useState } from 'react';
import {
  OrganizationDetailDTO,
  OrganizationStatus
} from '../../../generated/data-contracts';
import { PageRoutes } from '..';
import DetailContainer from '../../components/DetailContainer/DetailContainer';
import {
  accountingInfo,
  info,
  integrationBox,
  paymentInfo
} from './components/OrganizationDetailSections';
import { theme } from '@pagopa/mui-italia';
import { useLanguage } from '../../hooks/useLanguage';
import EditIcon from '@mui/icons-material/Edit';
import utils from '../../utils';
import { OrganizationDetailAlert } from './components/OrganizationDetailAlert';
import logoBoxPlaceholder from '../../assets/logoBox.jpg';

export const OrganizationDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { language } = useLanguage();

  const displayNames = new Intl.DisplayNames(language, { type: 'language' });

  const { organizationId: organizationIdByURL } = useParams<{
    organizationId: string;
  }>();
  const {
    state: { organizationId }
  } = useStore();

  const [organizationDetailData, setOrganizationDetailData] =
    useState<OrganizationDetailDTO>();

  const getOrganizationId = !isNaN(Number(organizationIdByURL))
    ? Number(organizationIdByURL)
    : organizationId;

  const { isError, isSuccess, data, refetch } =
    getOrganizationDetail(getOrganizationId);

  useEffect(() => {
    if (isError) {
      navigate(PageRoutes.ORGANIZATIONS_INDEX);
    } else {
      setOrganizationDetailData(data);
    }
  }, [data]);

  const handleEditClick = () => {
    navigate(
      generatePath(PageRoutes.ORGANIZATIONS_EDIT, {
        organizationId: getOrganizationId
      })
    );
  };

  const isSuperAdmin = utils.roles.useIsSuperAdmin();

  const canShowEdit =
    organizationDetailData?.status === OrganizationStatus.DRAFT && isSuperAdmin;

  const update = updateOrganization();

  const filledFieldsConditions =
    organizationDetailData?.orgLogo &&
    organizationDetailData?.segregationCode &&
    organizationDetailData?.iban;

  const updateOrg = async () => {
    if (!filledFieldsConditions) {
      utils.notify.emit(t('organizations.enableDialog.emptyFields'), 'error');
      return;
    }
    if (organizationDetailData) {
      try {
        await update.mutateAsync({
          organizationId: organizationDetailData.organizationId,
          organizationData: {
            ...organizationDetailData,
            status: OrganizationStatus.ACTIVE
          }
        });
        // reload Get to obtain fresh data (and hide the enableButton)
        refetch();
        utils.notify.emit(t('organizations.enableDialog.success'), 'success');
      } catch {
        utils.notify.emit(t('organizations.enableDialog.error'), 'error');
      }
    }
    utils.dialog.close();
  };

  const handleActivateClick = () => {
    utils.dialog.open({
      ['data-testid']: 'enable-org-dialog',
      title: t('organizations.enableDialog.title'),
      message: (
        <Trans
          i18nKey="organizations.enableDialog.message"
          values={{ orgName: organizationDetailData?.orgName || '' }}
        />
      ),
      confirmLabel: t('organizations.enableOrg'),
      cancelLabel: t('commons.close'),
      onConfirm: updateOrg,
      onClose: () => utils.dialog.close()
    });
  };

  const callToAction: Array<ActionMenuItem | React.ReactNode> = [
    {
      icon: <EditIcon />,
      onActionClick: handleEditClick,
      isIconButton: true,
      color: 'primary',
      dataTestId: 'edit-organization-button'
    }
  ];

  if (canShowEdit) {
    callToAction.push({
      buttonText: t('organizations.enableOrg'),
      onActionClick: handleActivateClick,
      color: 'primary',
      dataTestId: 'enable-organization-button'
    });
  }

  return (
    <>
      <TitleComponent
        title={(isSuccess && organizationDetailData?.orgName) || ''}
        callToAction={callToAction}
      />
      {canShowEdit && (
        <OrganizationDetailAlert
          editFunction={handleEditClick}
          organizationDetailData={organizationDetailData}
        />
      )}
      <Grid
        container
        direction={'column'}
        rowSpacing={2}
        justifyContent={'flex-start'}
        mt={2}
      >
        <Grid item xs={12}>
          <Grid container direction={'row'} spacing={2}>
            <Grid item md={7}>
              {organizationDetailData && (
                <DetailContainer
                  omitFlexGridDirection={true}
                  sections={[
                    {
                      inline: true,
                      inlineSizeFirstElement: 5,
                      title: {
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        fontSize: '14px',
                        label: t('commons.infoSingular')
                      },
                      data: info(organizationDetailData, t)
                    }
                  ]}
                />
              )}
            </Grid>
            <Grid item md={5}>
              <Box
                borderRadius={2}
                bgcolor={theme.palette.background.paper}
                padding={3}
              >
                {/* Titolo */}
                <Typography
                  variant="overline"
                  component="h3"
                  sx={{
                    fontWeight: 700,
                    fontSize: '14px',
                    color: theme.palette.text.primary,
                    display: 'block',
                    mb: 2
                  }}
                >
                  {t('organizations.orgLogo')}
                </Typography>

                <Box display="flex" justifyContent="center" mb={2}>
                  <Box
                    sx={{
                      border: `1px solid ${theme.palette.grey[300]}`,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 3,
                      width: '200px',
                      height: '200px',
                      bgcolor: organizationDetailData?.orgLogo
                        ? theme.palette.common.white
                        : theme.palette.grey[50]
                    }}
                  >
                    {organizationDetailData?.orgLogo ? (
                      <img
                        src={organizationDetailData.orgLogo}
                        alt={t('organizations.orgLogo')}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <img
                        src={logoBoxPlaceholder}
                        alt={t('organizations.logoPlaceholder')}
                        style={{
                          objectFit: 'contain',
                          opacity: 0.5
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {organizationDetailData?.orgLogo ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ fontSize: '14px' }}
                  >
                    {t('organizations.orgLogoDescription')}
                  </Typography>
                ) : (
                  <Alert
                    severity="error"
                    sx={{
                      '& .MuiAlert-message': {
                        fontSize: '14px'
                      }
                    }}
                  >
                    {t('organizations.orgLogoMissingAlert')}
                  </Alert>
                )}
              </Box>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          {organizationDetailData && (
            <DetailContainer
              omitFlexGridDirection={true}
              sections={[
                {
                  inline: true,
                  inlineSizeFirstElement: 3,
                  title: {
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    fontSize: '14px',
                    label: t('commons.accountingInformation')
                  },
                  data: accountingInfo(organizationDetailData, t)
                }
              ]}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          {organizationDetailData && (
            <DetailContainer
              omitFlexGridDirection={true}
              sections={[
                {
                  inline: true,
                  inlineSizeFirstElement: 3,
                  title: {
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    fontSize: '14px',
                    label: t('commons.payments')
                  },
                  data: paymentInfo(organizationDetailData, t, displayNames)
                }
              ]}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          {organizationDetailData && (
            <DetailContainer
              omitFlexGridDirection={true}
              sections={[
                {
                  inline: true,
                  inlineSizeFirstElement: 3,
                  title: {
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    fontSize: '14px',
                    label: t('organizations.otherProducts')
                  },
                  data: integrationBox(organizationDetailData, t)
                }
              ]}
            />
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default OrganizationDetail;
