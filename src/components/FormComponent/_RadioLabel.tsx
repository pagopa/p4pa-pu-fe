import { Stack, Typography } from '@mui/material';

export const _RadioLabel = ({
  label,
  description
}: {
  label: string;
  description?: string;
}) => (
  <Stack my={2}>
    <Typography fontSize="16px" fontWeight={600}>
      {label}
    </Typography>
    {description && (
      <Typography fontSize="14px" fontWeight={400}>
        {description}
      </Typography>
    )}
  </Stack>
);
