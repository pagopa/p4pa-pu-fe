import React from 'react';
import { Tooltip, Chip } from '@mui/material';
import { ChipProps } from '@mui/material/Chip';

type ChipTruncateTooltipProps = ChipProps & {
  tooltipLabel?: string;
};

const ChipTruncateTooltip: React.FC<ChipTruncateTooltipProps> = ({
  label,
  color,
  variant,
  tooltipLabel,
  ...otherProps
}) => {
  return (
    <Tooltip title={tooltipLabel || label} arrow>
      <Chip
        label={label}
        color={color}
        size="small"
        variant={variant || 'filled'}
        sx={{
          '.MuiChip-label': {
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            display: 'block',
            cursor: 'default'
          }
        }}
        {...otherProps}
      />
    </Tooltip>
  );
};

export default ChipTruncateTooltip;
