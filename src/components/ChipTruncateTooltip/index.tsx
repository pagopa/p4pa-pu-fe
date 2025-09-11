import React from 'react';
import { Tooltip, Chip } from '@mui/material';
import { ChipProps } from '@mui/material/Chip';

const ChipTruncateTooltip: React.FC<ChipProps> = ({
  label,
  color,
  variant
}) => {
  return (
    <Tooltip title={label} arrow>
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
      />
    </Tooltip>
  );
};

export default ChipTruncateTooltip;
