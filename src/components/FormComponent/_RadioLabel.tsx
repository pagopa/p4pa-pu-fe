import { Stack, Typography } from '@mui/material';

export const _RadioLabel = ({
  label,
  description
}: {
  label: string;
  description?: string;
}) => (
  <Stack my={2}>
    <Typography fontWeight={600}>{label}</Typography>
    {description && <Typography variant="caption">{description}</Typography>}
  </Stack>
);
