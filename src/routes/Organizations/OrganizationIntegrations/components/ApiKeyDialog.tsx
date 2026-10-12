import ContentCopyIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { OrganizationApiKey } from '@generated/core/data-contracts';

import {
  deleteOrganizationApiKey,
  getOrganizationApiKey
} from '@core/api/organizations';
import utils from '@core/utils';
import { SECRET_MASK } from '@core/components/ShowSecretValue';

type Props = {
  apiKey: OrganizationApiKey;
  organizationId: number;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
};

export const ApiKeyDialog = ({
  apiKey,
  organizationId,
  open,
  onClose,
  onDelete
}: Props) => {
  const { t } = useTranslation();
  const titleId = useId();
  const descriptionId = useId();
  const [isVisible, setIsVisible] = useState(false);

  const { data } = getOrganizationApiKey(organizationId, apiKey.keyType);

  const deleteApiKey = deleteOrganizationApiKey(organizationId, apiKey.keyType);

  const handleDelete = async () => {
    try {
      await deleteApiKey.mutateAsync();
      utils.notify.emit('commons.done', 'success');
      onDelete();
    } catch {
      utils.notify.emit('errors.generic');
    } finally {
      onClose();
    }
  };

  const handleCopy = () =>
    void navigator.clipboard.writeText(data?.apiKey || '');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      sx={{ padding: 3 }}
    >
      <DialogTitle id={titleId} gap={1}>
        <Typography variant="h6">
          {t(`integrations.keyTypes.${apiKey.keyType}`)}
        </Typography>
        <Typography id={descriptionId} variant="body2">
          {t('integrations.apiKeyDialog.description')}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack gap={2}>
          {/* TODO: activation toggle */}

          <Divider />

          <Stack gap={1}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle2">
                {t('integrations.apiKeyDialog.apiKey')}
              </Typography>
              <IconButton
                aria-label={t(
                  isVisible
                    ? 'integrations.apiKeyDialog.hide'
                    : 'integrations.apiKeyDialog.show'
                )}
                onClick={() => setIsVisible((visible) => !visible)}
              >
                {isVisible ? (
                  <VisibilityOffIcon color="primary" />
                ) : (
                  <VisibilityIcon color="primary" />
                )}
              </IconButton>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              gap={1}
            >
              <Typography variant="monospaced" component="span" ml={1}>
                {isVisible ? data?.apiKey : SECRET_MASK}
              </Typography>
              <IconButton
                aria-label={t('integrations.apiKeyDialog.copy')}
                onClick={handleCopy}
              >
                <ContentCopyIcon color="primary" />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          color="error"
          startIcon={<DeleteOutlineIcon />}
          disabled={deleteApiKey.isPending}
          onClick={handleDelete}
        >
          {t('commons.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
