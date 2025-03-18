import Tooltip from '@mui/material/Tooltip';
import Typography, { TypographyProps } from '@mui/material/Typography';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { copyToClipboard } from '../../utils/clipboard';

export const CopiableTypography = (props: Omit<TypographyProps, 'onClick'>) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const handleCopy = () => {
    const text = typeof props.children === 'string' ? props.children : '';
    if (text) {
      copyToClipboard(text, setCopied);
      setTimeout(() => setCopied(false), 2000); // Closes after 2 seconds
    }
  };

  return (
    <Tooltip
      placement="top-start"
      title={copied ? t('commons.copied') : ''}
      open={copied} // Only show tooltip when copied
    >
      <Typography
        {...props}
        sx={{ cursor: 'pointer', userSelect: 'none', ...props.sx }}
        onClick={handleCopy}
      />
    </Tooltip>
  );
};
