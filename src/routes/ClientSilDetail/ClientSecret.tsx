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

type ClientSecretProps = {
  secretValue: string;
};

const ClientSecret = ({ secretValue }: ClientSecretProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [tooltipTriggered, setTooltipTriggered] = useState<boolean>(false);

  const toggleValue = () => {
    setShowSecret(!showSecret);
  };

  const handleCopy = () => {
    copyToClipboard(secretValue, () => setTooltipTriggered(true));
  };

  return (
    <>
      <Stack spacing={1} direction={'row'} alignItems={'center'} mt={2}>
        <Typography variant="body2" color={theme.palette.action.active}>
          Secret
        </Typography>
        <Button size="small" onClick={toggleValue}>
          {!showSecret ? (
            <VisibilityIcon color="primary" />
          ) : (
            <VisibilityOffIcon color="primary" />
          )}
        </Button>
      </Stack>
      <Grid container gap={1}>
        <Grid xs={6}>
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
                {secretValue}
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
        <Grid xs={4}>
          <Button variant="outlined" size="small">
            <CachedIcon color="primary"></CachedIcon>&nbsp;{t('commons.reload')}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};
export default ClientSecret;
