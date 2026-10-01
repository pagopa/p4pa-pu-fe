import utils from '@core/utils';
import { Card, Divider, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const DEFAULT_EMPTY_VALUE = '_';

type SubUnitSummaryProps = {
  subUnitCode?: string;
  subUnitType?: string;
  subUnitName?: string;
  creationDate?: string;
};

const SummaryRow = ({
  title,
  value,
  valueSize = 14
}: {
  title: string;
  value?: string;
  valueSize?: number;
}) => (
  <Stack gap={1}>
    <Typography color="text.secondary" fontSize={14}>
      {title}
    </Typography>
    <Typography color="text.primary" fontWeight={500} fontSize={valueSize}>
      {value || DEFAULT_EMPTY_VALUE}
    </Typography>
  </Stack>
);

export const SubUnitSummary = ({
  subUnitCode,
  subUnitType,
  subUnitName,
  creationDate
}: SubUnitSummaryProps) => {
  const { t } = useTranslation();
  return (
    <Card component="section">
      <Stack p={3} gap={1.5}>
        <Typography
          textTransform="uppercase"
          color="text.secondary"
          fontSize={14}
          fontWeight={500}
          component="h2"
        >
          {t('commons.registry')}
        </Typography>
        <SummaryRow
          title={t('subunits.subUnitCode')}
          value={subUnitCode}
          valueSize={16}
        />
        <Divider />
        <SummaryRow title={t('subunits.subUnitType')} value={subUnitType} />
        <Divider />
        <SummaryRow title={t('subunits.subUnitName')} value={subUnitName} />
        <Divider />
        <SummaryRow
          title={t('commons.creationDate')}
          value={
            creationDate
              ? utils.formatters.formatDate(creationDate, 'dd MMMM yyyy')
              : undefined
          }
        />
      </Stack>
    </Card>
  );
};
