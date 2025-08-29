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
import GenericDialog from '../../components/GenericDialog/GenericDialog';
import orgSilServiceApi from '../../api/orgSilService';
import { DetailSectionProps } from '../../components/DetailContainer/DetailContainer';
import { getOrgSilServiceSectionsConfig } from './model/OrgSilServiceSectionConfigs';
import { PageRoutes } from '..';

type DialogConfig = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  testId: string;
};

export const OrgSilServiceDetailPage = () => {
  const [sections, setSections] = useState<DetailSectionProps['sections']>([]);
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);
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
    setDialogConfig({
      open: true,
      title: t('orgSilServiceDetail.delete.title'),
      message: t('orgSilServiceDetail.delete.message'),
      confirmLabel: t('commons.delete'),
      cancelLabel: t('commons.cancel'),
      onConfirm: handleDeleteConfirm,
      onClose: () => setDialogConfig(null),
      testId: 'delete-orgSilService-dialog'
    });
  };

  const showConflictDialog = () => {
    setDialogConfig({
      open: true,
      title: t('orgSilServiceDetail.delete.conflict.title'),
      message: t('orgSilServiceDetail.delete.conflictMessage'),
      confirmLabel: t('commons.close'),
      onConfirm: () => setDialogConfig(null),
      onClose: () => setDialogConfig(null),
      testId: 'conflict-error-dialog'
    });
  };

  const handleDeleteClick = () => {
    showDeleteDialog();
  };

  const handleDeleteConfirm = async () => {
    if (!orgSilServiceId) return;

    try {
      await deleteMutation.mutateAsync(Number(orgSilServiceId));
      setDialogConfig(null);
      navigate(PageRoutes.ORG_SIL_SERVICE_INDEX);
    } catch (error) {
      setDialogConfig(null);

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

      {dialogConfig && (
        <GenericDialog
          open={dialogConfig.open}
          title={dialogConfig.title}
          message={dialogConfig.message}
          confirmLabel={dialogConfig.confirmLabel}
          cancelLabel={dialogConfig.cancelLabel}
          onConfirm={dialogConfig.onConfirm}
          onClose={dialogConfig.onClose}
          data-testid={dialogConfig.testId}
        />
      )}
    </>
  );
};

export default OrgSilServiceDetailPage;
