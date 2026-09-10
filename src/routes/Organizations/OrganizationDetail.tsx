import { Button, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, useNavigate, useParams } from 'react-router';
import EditIcon from '@mui/icons-material/Edit';

import { PageRoutes } from '..';
import {
  type OrganizationDetail as OrganizationDetailDTO,
  OrganizationStatus
} from '../../../generated/core/data-contracts';
import {
  getOrganizationDetail,
  updateOrganization
} from '../../api/organizations';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { useLanguage } from '../../hooks/useLanguage';
import { useStore } from '../../store/GlobalStore';
import utils from '../../utils';
import { OrganizationDetailAlert } from './components/OrganizationDetailAlert';
import {
  Accounting,
  Management,
  Payment,
  Registry
} from './components/OrganizationDetailSections';
import { OrgAvatar } from '@core/components/OrgAvatar';

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
      utils.dialog.close();
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

  const CallToAction = () => (
    <Stack direction="row" alignItems="center" gap={2} key="call-to-action">
      {canShowEdit && (
        <Button
          key="enable"
          variant="contained"
          onClick={handleActivateClick}
          data-testid="enable-organization-button"
          color="primary"
        >
          {t('organizations.enableOrg')}
        </Button>
      )}
      <Button
        key="edit"
        variant="outlined"
        startIcon={<EditIcon />}
        onClick={handleEditClick}
        data-testid="edit-organization-button"
      >
        {t('commons.edit')}
      </Button>
      {/* TODO: add when real route is available */}
      {/* <Button */}
      {/*   key="manage-integrations" */}
      {/*   variant="contained" */}
      {/*   startIcon={<SettingsIcon />} */}
      {/*   onClick={handleManageIntegrationsClick} */}
      {/*   data-testid="manage-integrations-button" */}
      {/* > */}
      {/*   {t('organizations.manageIntegrations')} */}
      {/* </Button> */}
    </Stack>
  );

  const OrganizationLogo = () => (
    <OrgAvatar
      src={organizationDetailData?.orgLogo}
      alt={`${organizationDetailData?.orgName} logo`}
    />
  );

  return (
    <Stack gap={5} pb={5}>
      <TitleComponent
        title={(isSuccess && organizationDetailData?.orgName) || ''}
        startDecoration={<OrganizationLogo />}
        callToAction={[<CallToAction key="call-to-action" />]}
      />

      {canShowEdit && (
        <OrganizationDetailAlert
          editFunction={handleEditClick}
          organizationDetailData={organizationDetailData}
        />
      )}

      {organizationDetailData && (
        <>
          <Stack direction="row" gap={2} width="100%">
            <Registry organizationDetailData={organizationDetailData} />
            <Management organizationDetailData={organizationDetailData} />
          </Stack>

          <Accounting organizationDetailData={organizationDetailData} />

          <Payment
            organizationDetailData={organizationDetailData}
            displayNames={displayNames}
          />
        </>
      )}
    </Stack>
  );
};
