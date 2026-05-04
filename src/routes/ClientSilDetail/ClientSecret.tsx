import {
  Box,
  Button,
  Grid,
  Stack,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CachedIcon from '@mui/icons-material/Cached';
import { useState } from 'react';
import { copyToClipboard } from '../../utils/clipboard';
import { ContentCopy } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import utils from '../../utils';
import { generateClientSecret } from '../../api/clientSil';

type ClientSecretProps = {
  secretValue: string;
  organizationId: number;
  clientId: string;
};

const ClientSecret = ({
  secretValue,
  organizationId,
  clientId
}: ClientSecretProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [currentSecretValue, setCurrentSecretValue] = useState(secretValue);
  const [tooltipTriggered, setTooltipTriggered] = useState<boolean>(false);

  const reloadSecretMutation = generateClientSecret(organizationId);

  const toggleValue = () => {
    setShowSecret(!showSecret);
  };

  const handleCopy = () => {
    copyToClipboard(currentSecretValue, () => setTooltipTriggered(true));
  };

  const handleReloadSecret = async () => {
    try {
      const data = await reloadSecretMutation.mutateAsync(clientId);
      setCurrentSecretValue(data.clientSecret);
      setShowSecret(true);
      utils.notify.emit(t('clientSilDetail.reloadSecretOK'), 'success');
    } catch {
      utils.notify.emit(t('clientSilDetail.reloadSecretKO'), 'error');
    }
  };

  return (
    <>
      <Stack spacing={1} direction={'row'} alignItems={'center'} mt={2}>
        <Typography variant="body2" color={theme.palette.action.active}>
          {t('commons.secret')}
        </Typography>
        <Button
          size="small"
          onClick={toggleValue}
          data-testid="show-secret-value"
        >
          {!showSecret ? (
            <VisibilityIcon color="primary" />
          ) : (
            <VisibilityOffIcon color="primary" />
          )}
        </Button>
      </Stack>
      <Grid container gap={1}>
        <Grid item xs={8}>
          <Stack
            spacing={2}
            direction={'row'}
            alignItems={'center'}
            justifyContent={'space-between'}
            bgcolor={theme.palette.grey[50]}
          >
            {showSecret ? (
              <Typography
                fontFamily={'monospace'}
                pl={2}
                sx={{
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}
              >
                {currentSecretValue}
              </Typography>
            ) : (
              <Typography pl={2} overflow={'hidden'}>
                ••••••••••••••••••••••••••
              </Typography>
            )}

            <Box>
              <Tooltip
                title={t('commons.copied')}
                open={tooltipTriggered}
                onClose={() => setTooltipTriggered(false)}
              >
                <Button
                  onClick={handleCopy}
                  size="small"
                  sx={{
                    minWidth: 'auto',
                    padding: 0.5,
                    flexShrink: 0
                  }}
                  data-testid="specific-params-copy-button"
                >
                  <ContentCopy
                    fontSize="small"
                    sx={{ color: 'primary.main' }}
                  />
                </Button>
              </Tooltip>
            </Box>
          </Stack>
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleReloadSecret}
            data-testid="reload-secret-button"
          >
            <CachedIcon color="primary"></CachedIcon>&nbsp;{t('commons.reload')}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};
export default ClientSecret;
