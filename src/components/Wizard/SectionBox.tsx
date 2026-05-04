import { Stack, Typography } from '@mui/material';
import { PropsWithChildren } from 'react';

type SectionBoxProps = {
  title: string;
  subtitle?: string;
  adornment?: JSX.Element;
};

const SectionBox = ({
  title,
  subtitle,
  children,
  adornment
}: PropsWithChildren<SectionBoxProps>) => (
  <Stack
    sx={{ borderColor: 'divider' }}
    border={1}
    borderRadius={4}
    p={3}
    mt={3}
    gap={2}
  >
    <Stack gap={1}>
      <Stack direction="row" alignItems="center" gap={1} color="text.primary">
        {adornment}
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
      </Stack>
      <Typography color="text.secondary">{subtitle}</Typography>
    </Stack>
    {children}
  </Stack>
);

export default SectionBox;
