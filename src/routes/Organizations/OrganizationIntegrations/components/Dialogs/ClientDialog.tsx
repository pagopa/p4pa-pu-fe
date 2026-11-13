import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopyOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate } from 'react-router';

import type { PdndClientNoSecretDTO } from '@generated/core/data-contracts';

import { useDeletePdndClient } from '@core/api/integrations';
import { BaseDialog } from '@core/components/BaseDialog';
import { CopiableField } from '@core/components/CopiableField';
import { SECRET_MASK } from '@core/components/ShowSecretValue';
import { PageRoutes } from '@core/routes';
import { IntegrationType } from '@core/routes/Organizations/enums';
import { copyWithFeedback } from '@core/utils/clipboard';
import notify from '@core/utils/notify';

import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type PdndClientDialogProps = {
  open: boolean;
  client: PdndClientNoSecretDTO;
  organizationId: number;
  onClose: () => void;
  onDelete: () => void;
};

export const PdndClientDialog = ({
  open,
  client,
  organizationId,
  onClose,
  onDelete
}: PdndClientDialogProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  const copy = (value: string) => {
    copyWithFeedback(value, t('commons.copied'));
  };

  const deleteService = useDeletePdndClient(organizationId, client.clientId);

  const handleDelete = async () => {
    try {
      await deleteService.mutateAsync();
      notify.emit(t('commons.done'), 'success');
      onDelete();
    } catch {
      notify.emit(t('errors.generic'));
    } finally {
      onClose();
    }
  };

  const handleEdit = () => {
    const searchParams = new URLSearchParams({
      clientId: client.clientId
    });
    if (client.subUnitCode) {
      searchParams.set('subUnitCode', client.subUnitCode);
    }

    navigate(
      `${generatePath(PageRoutes.EDIT_INTEGRATION, {
        organizationId: String(organizationId),
        IntegrationType: IntegrationType.PDND_CLIENT
      })}?${searchParams.toString()}`
    );
  };

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={client.clientName}
      description={t('integrations.dialogDescription')}
      actions={
        <>
          <Button
            color="error"
            startIcon={<DeleteOutlineIcon />}
            disabled={deleteService.isPending}
            onClick={handleDelete}
          >
            {t('commons.delete')}
          </Button>
          <Button
            color="primary"
            variant="outlined"
            startIcon={<EditOutlinedIcon />}
            disabled={deleteService.isPending}
            onClick={handleEdit}
          >
            {t('commons.edit')}
          </Button>
        </>
      }
    >
      <Stack gap={2}>
        <CopiableField
          label={t('integrations.clientDialog.clientId')}
          value={client.clientId}
        />

        <Divider />
        <CopiableField
          label={t('integrations.clientDialog.kid')}
          copyLabel={t('commons.copy_male', {
            label: t('integrations.clientDialog.kid')
          })}
          value={client.kid}
        />

        <Divider />

        <Stack gap={1}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="subtitle2"
              color="text.dark"
              textTransform="uppercase"
            >
              {t('integrations.apiKeyDialog.apiKey')}
            </Typography>
            <IconButton
              size="small"
              aria-label={t(
                isVisible
                  ? 'integrations.apiKeyDialog.hide'
                  : 'integrations.apiKeyDialog.show'
              )}
              onClick={() => setIsVisible((visible) => !visible)}
            >
              {isVisible ? (
                <VisibilityOffIcon fontSize="small" color="primary" />
              ) : (
                <VisibilityIcon fontSize="small" color="primary" />
              )}
            </IconButton>
          </Stack>
          <Stack
            direction="row"
            py={1.5}
            justifyContent="space-between"
            alignItems="flex-start"
            gap={1}
          >
            <Typography
              variant="monospaced"
              color={'text.dark'}
              sx={{
                overflowWrap: 'anywhere',
                mt: 0.5
              }}
            >
              {isVisible ? client.publicKey : SECRET_MASK}
            </Typography>
            <IconButton
              aria-label={t('integrations.apiKeyDialog.copy')}
              onClick={() => copy(client.publicKey)}
              size="small"
            >
              <ContentCopyIcon color="primary" fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </BaseDialog>
  );
};
