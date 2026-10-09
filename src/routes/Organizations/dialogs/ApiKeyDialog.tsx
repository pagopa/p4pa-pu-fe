import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';
import {
  Box,
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
import { useParams } from 'react-router';

import { SECRET_MASK } from '../../../components/ShowSecretValue';
import { OrganizationApiKey } from '../../../../generated/core/data-contracts';

type Props = {
  apiKey: OrganizationApiKey;
  open: boolean;
  onClose: () => void;
};

export const ApiKeyDialog = ({ apiKey, open, onClose }: Props) => {
  const { t } = useTranslation();
  const organizationId = Number(useParams().organizationId);
  const titleId = useId();
  const descriptionId = useId();
  const [isVisible, setIsVisible] = useState(false);

  const keyValue = '';

  const { mutate: deleteApiKey, isPending } = {
    mutate: (_, { onSuccess }) => null,
    isPending: false
  };

  const handleDelete = () =>
    deleteApiKey(
      { organizationId, keyType: apiKey.keyType },
      { onSuccess: onClose }
    );

  const handleCopy = () => void navigator.clipboard.writeText(keyValue);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <DialogTitle id={titleId} sx={{ pr: 7 }}>
        {t(`keyTypes.${apiKey.keyType}`)}
      </DialogTitle>

      <DialogContent>
        <Stack gap={2}>
          <Typography id={descriptionId}>
            {t('apiKeyDialog.description')}
          </Typography>

          {/* TODO: activation toggle */}

          <Divider />

          <Stack gap={1}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle1">{t('apiKey')}</Typography>
              <IconButton
                aria-label={t(
                  isVisible ? 'apiKeyDialog.hide' : 'apiKeyDialog.show'
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
                {isVisible ? keyValue : SECRET_MASK}
              </Typography>
              <IconButton
                aria-label={t('apiKeyDialog.copy')}
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
          disabled={isPending}
          onClick={handleDelete}
        >
          {t('commons.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
