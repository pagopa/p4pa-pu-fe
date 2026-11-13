import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useId } from 'react';
import type { ReactNode } from 'react';

type FieldGroupProps = {
  title: string;
  children: ReactNode;
};

export const FieldGroup = ({ title, children }: FieldGroupProps) => {
  const titleId = useId();

  return (
    <Box
      role="group"
      aria-labelledby={titleId}
      sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}
    >
      <Typography id={titleId} variant="subtitle2" mb={2}>
        {title}
      </Typography>
      <Stack spacing={2}>{children}</Stack>
    </Box>
  );
};
