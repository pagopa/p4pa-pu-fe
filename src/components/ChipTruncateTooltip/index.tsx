import React from 'react';
import { Tooltip, Chip } from '@mui/material';
import { ChipProps } from '@mui/material/Chip';

const ChipTruncateTooltip: React.FC<ChipProps> = ({ label, color }) => {
  return (
    <Tooltip title={label} arrow>
      <Chip
        label={label}
        color={color}
        size="small"
        sx={{
          '.MuiChip-label': {
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            display: 'block'
          }
        }}
      />
    </Tooltip>
  );
};

export default ChipTruncateTooltip;
