import React, { useState } from 'react';
import { Box, Typography, Button, Tooltip } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { copyToClipboard } from '../../../utils/clipboard';

type ExpandableCardProps = {
  content: string;
  t: (key: string) => string;
  maxPreviewLength?: number;
};

export const ExpandableCard: React.FC<ExpandableCardProps> = ({
  content,
  t,
  maxPreviewLength = 50
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const { t: tCommons } = useTranslation();

  const shouldTruncate = content.length > maxPreviewLength;
  const displayContent =
    isExpanded || !shouldTruncate
      ? content
      : content.substring(0, maxPreviewLength) + '...';

  const handleCopy = () => {
    copyToClipboard(content, setCopied);
    setTimeout(() => setCopied(false), 2000); // Closes after 2 seconds
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 1,
          ...(isExpanded ? {} : { maxHeight: '120px', overflow: 'hidden' })
        }}
      >
        <Typography
          variant="body1"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
          data-testid="specific-params-content"
        >
          {displayContent}
        </Typography>

        <Tooltip
          placement="top"
          title={copied ? tCommons('commons.copied') : ''}
          open={copied}
          data-testid="specific-params-copy-tooltip"
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
            <ContentCopy fontSize="small" sx={{ color: 'primary.main' }} />
          </Button>
        </Tooltip>
      </Box>

      {shouldTruncate && (
        <Button
          variant="text"
          size="small"
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{
            marginTop: 1,
            padding: 0,
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'none',
            color: 'primary.main'
          }}
          data-testid="specific-params-show-button"
        >
          {isExpanded ? t('commons.showLess') : t('commons.showMore')}
        </Button>
      )}
    </Box>
  );
};
