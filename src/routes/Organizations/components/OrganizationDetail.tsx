import { Box, Grid } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import TitleComponent, {
  ActionMenuItem
} from '../../../components/TitleComponent/TitleComponent';
import { useNavigate, useParams, generatePath } from 'react-router';
import { useStore } from '../../../store/GlobalStore';
import {
  getOrganizationDetail,
  updateOrganization
} from '../../../api/organizations';
import { useEffect, useState } from 'react';
import {
  OrganizationDetailDTO,
  OrganizationStatus
} from '../../../../generated/data-contracts';
import { PageRoutes } from '../..';
import DetailContainer from '../../../components/DetailContainer/DetailContainer';
import {
  accountingInfo,
  info,
  integrationBox,
  paymentInfo
} from './OrganizationDetailSections';
import { theme } from '@pagopa/mui-italia';
import { useLanguage } from '../../../hooks/useLanguage';
import EditIcon from '@mui/icons-material/Edit';
import utils from '../../../utils';
import { OrganizationDetailAlert } from '../OrganizationDetailAlert';

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
                padding={2}
                display={'flex'}
                justifyContent={'center'}
              >
                {organizationDetailData?.orgLogo && (
                  <Box
                    sx={{
                      border: `1px solid ${theme.palette.grey[300]}`,
                      borderRadius: 2,
                      display: 'inline-block',
                      fontSize: 0,
                      padding: 2,
                      width: '150px'
                    }}
                  >
                    <img src={organizationDetailData.orgLogo} width={'100%'} />
                  </Box>
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
