// EntityCard.tsx
import { Typography, Box, Stack, Card } from '@mui/material';
import { ChevronRight, MarkEmailReadOutlined } from '@mui/icons-material';
import { CampaignRow } from '../CampaignCardGrid';

const EntityCardField = ({
  icon,
  label,
  value
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) => (
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

export const EntityCard = ({ row }: { row: CampaignRow }) => {
  return (
    <Card sx={{ p: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        width="100%"
        justifyContent="space-between"
      >
        <EntityCardField label={row.id} value={row.title} />

        <EntityCardField
          label="Data di invio"
          value={`${row.sentDateFrom} - ${row.sentDateTo}`}
        />

        <EntityCardField
          icon={
            <MarkEmailReadOutlined
              sx={{ color: 'grey.400' }}
              fontSize="small"
            />
          }
          label="Perfezionate / Inviate"
          value={`${String(row.completed).padStart(4, '0')}/${String(row.sent).padStart(4, '0')}`}
        />

        <Box
          component="a"
          href={row.detailUrl}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'primary.main',
            fontWeight: 600,
            fontSize: '16px',
            textDecoration: 'none',
            justifySelf: 'end',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          Apri dettaglio
          <ChevronRight fontSize="small" />
        </Box>
      </Stack>
    </Card>
  );
};
