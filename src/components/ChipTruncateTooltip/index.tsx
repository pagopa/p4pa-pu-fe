import type React from 'react';
import type { ChipProps } from '@mui/material/Chip';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';

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
