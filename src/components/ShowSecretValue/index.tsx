import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';
import { copyToClipboard } from '../../utils/clipboard';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import ContentCopy from '@mui/icons-material/ContentCopy';

export const SECRET_MASK = '••••••••••••••••••••••••••';

type ShowSecretValueProps = {
  label: string;
  secretValue?: string;
};

const ShowSecretValue = ({ label, secretValue }: ShowSecretValueProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [tooltipTriggered, setTooltipTriggered] = useState<boolean>(false);

  const toggleValue = () => {
    setShowSecret(!showSecret);
  };

  const handleCopy = () => {
    copyToClipboard(secretValue || '', () => setTooltipTriggered(true));
  };

  return (
    <>
      <Grid container>
        <Grid item xs={3}>
          <Stack spacing={1} direction={'row'} alignItems={'center'}>
            <Typography variant="body2" color={theme.palette.action.active}>
              {label}
            </Typography>
            {secretValue && (
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
            )}
          </Stack>
        </Grid>
        <Grid item xs={9}>
          {secretValue && (
            <Stack
              spacing={2}
              direction={'row'}
              display={'inline-flex'}
              alignItems={'center'}
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
                  {SECRET_MASK}
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
          )}
        </Grid>
      </Grid>
    </>
  );
};
export default ShowSecretValue;
