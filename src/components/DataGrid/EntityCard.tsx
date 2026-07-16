import { Typography, Stack, Card } from '@mui/material';

export type EntityRowDetail = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

const EntityCardField = ({ icon, label, value }: EntityRowDetail) => (
  <Stack direction="row" alignItems="center" gap={2}>
    {icon}
    <Stack>
      <Typography
        variant="body2"
        fontSize={14}
        color="text.secondary"
        fontWeight={400}
      >
        {label}
      </Typography>
      <Typography variant="subtitle1" fontSize={16}>
        {value}
      </Typography>
    </Stack>
  </Stack>
);

type EntityCardProps = {
  row: Array<EntityRowDetail>;
  cta: React.ReactNode;
};

export const EntityCard = ({ row, cta }: EntityCardProps) => {
  return (
    <Card sx={{ p: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        width="100%"
        justifyContent="space-between"
      >
        {row.map((item, index) => (
          <EntityCardField key={index} {...item} />
        ))}

        {cta}
      </Stack>
    </Card>
  );
};
