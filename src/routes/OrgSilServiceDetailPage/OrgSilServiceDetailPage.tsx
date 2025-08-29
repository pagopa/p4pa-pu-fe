import { Box, Button, Stack } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { STATE } from '../../store/types';
import { useStore } from '../../store/GlobalStore';
import DetailContainer from '../../components/DetailContainer/DetailContainer';
import orgSilServiceApi from '../../api/orgSilService';
import { DetailSectionProps } from '../../components/DetailContainer/DetailContainer';
import { getOrgSilServiceSectionsConfig } from './model/OrgSilServiceSectionConfigs';
import { PageRoutes } from '..';
import utils from '../../utils';

export const OrgSilServiceDetailPage = () => {
  const [sections, setSections] = useState<DetailSectionProps['sections']>([]);
  const { state } = useStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const { orgSilServiceId } = useParams<{
    orgSilServiceId: string;
  }>();

  const { data, isSuccess } = orgSilServiceApi.getOrgSilServiceById({
    organizationId,
    orgSilServiceId: Number(orgSilServiceId)
  });

  const deleteMutation = orgSilServiceApi.deleteOrgSilService({
    organizationId
  });

  useEffect(() => {
    if (isSuccess && data?.response) {
      const sectionsConfig = getOrgSilServiceSectionsConfig(data.response, t);
      setSections(sectionsConfig);
    }
  }, [data, isSuccess, t]);

  const showDeleteDialog = () => {
    utils.dialog.open({
      title: t('orgSilServiceDetail.delete.title'),
      message: t('orgSilServiceDetail.delete.message'),
      confirmLabel: t('commons.delete'),
      cancelLabel: t('commons.cancel'),
      onConfirm: handleDeleteConfirm,
      onClose: () => utils.dialog.close(),
      'data-testid': 'delete-orgSilService-dialog'
    });
  };

  const showConflictDialog = () => {
    utils.dialog.open({
      title: t('orgSilServiceDetail.delete.conflict.title'),
      message: t('orgSilServiceDetail.delete.conflictMessage'),
      confirmLabel: t('commons.close'),
      onConfirm: () => utils.dialog.close(),
      onClose: () => utils.dialog.close(),
      'data-testid': 'conflict-error-dialog'
    });
  };

  const handleDeleteClick = () => {
    showDeleteDialog();
  };

  const handleDeleteConfirm = async () => {
    if (!orgSilServiceId) return;

    try {
      await deleteMutation.mutateAsync(Number(orgSilServiceId));
      utils.dialog.close();
      navigate(PageRoutes.ORG_SIL_SERVICE_INDEX);
    } catch (error) {
      utils.dialog.close();

      if (error instanceof AxiosError && error.response?.status === 409) {
        showConflictDialog();
      }
    }
  };

  const actionButtons = [
    {
      icon: <Delete />,
      buttonText: t('commons.delete'),
      color: 'error' as const,
      variant: 'outlined' as const,
      disabled: deleteMutation.isPending,
      onActionClick: handleDeleteClick
    },
    {
      icon: <Edit />,
      buttonText: t('commons.edit'),
      color: 'primary' as const,
      variant: 'contained' as const,
      disabled: false,
      onActionClick: () =>
        navigate(
          generatePath(PageRoutes.ORG_SIL_SERVICE_EDIT, {
            orgSilServiceId: Number(orgSilServiceId)
          })
        )
    }
  ];

  return (
    <>
      <TitleComponent
        title={data?.response?.applicationName || '-'}
        description={t('orgSilServiceDetail.description')}
      />

      <Box mt={3}>
        <Stack spacing={2}>
          <DetailContainer sections={sections} fullWidthSections={true} />
        </Stack>
      </Box>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Stack spacing={2} direction="row">
          {actionButtons.map((button, index) => (
            <Button
              size="large"
              key={index}
              startIcon={button.icon}
              color={button.color}
              variant={button.variant}
              disabled={button.disabled}
              onClick={button.onActionClick}
            >
              {button.buttonText}
            </Button>
          ))}
        </Stack>
      </Box>
    </>
  );
};

export default OrgSilServiceDetailPage;
