import { useState } from 'react';
import {
  Box,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  DebtPositionTypeOrgBalanceCostDTO,
  DebtPositionTypeOrgBalanceCostType
} from '../../../generated/apiClient';

type Props = {
  costs: Array<DebtPositionTypeOrgBalanceCostDTO>;
};

// Fixed display order of the cost groups, matching the design
const COST_TYPE_ORDER: Array<DebtPositionTypeOrgBalanceCostType> = [
  DebtPositionTypeOrgBalanceCostType.NOTIFICATION_COST,
  DebtPositionTypeOrgBalanceCostType.DELAY_COST,
  DebtPositionTypeOrgBalanceCostType.INTEREST_COST
];

// Rows rendered for each cost group, in display order
const ROW_FIELDS = [
  'sectionCode',
  'sectionDescription',
  'officeCode',
  'officeDescription',
  'assessmentCode',
  'assessmentDescription'
] as const;

const currentYear = new Date().getFullYear();
// Always show the previous, current and next year, regardless of data
const YEARS = [currentYear - 1, currentYear, currentYear + 1].map(String);

export const BudgetCostsDetail = ({ costs }: Props) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [activeYear, setActiveYear] = useState(String(currentYear));

  const yearCosts = costs.filter((cost) => cost.operatingYear === activeYear);

  return (
    <Box>
      <Tabs
        value={activeYear}
        onChange={(_event, value) => setActiveYear(value)}
        variant="fullWidth"
        aria-label={t(
          'debtTypeOrgCreate.accounting.section.specificBudgetItems'
        )}
        sx={{
          borderBottom: 1,
          borderColor: theme.palette.divider,
          mb: 2
        }}
      >
        {YEARS.map((year) => (
          <Tab key={year} value={year} label={year} />
        ))}
      </Tabs>

      <Stack spacing={3}>
        {COST_TYPE_ORDER.map((type) => {
          // Missing groups/values are still shown with a "-" placeholder
          const cost = yearCosts.find((item) => item.type === type);

          return (
            <Box key={type}>
              <Typography
                variant="caption-semibold"
                color={theme.palette.action.active}
                sx={{ textTransform: 'uppercase' }}
              >
                {t(`debtTypeOrgCreate.accounting.budgetCost.type.${type}`)}
              </Typography>

              <Box mt={1}>
                {ROW_FIELDS.map((field) => (
                  <Grid container py={1} key={field}>
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="body2"
                        color={theme.palette.action.active}
                      >
                        {t(`debtTypeOrgCreate.accounting.budgetCost.${field}`)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        sx={{ wordBreak: 'break-word' }}
                      >
                        {cost?.[field] || '-'}
                      </Typography>
                    </Grid>
                  </Grid>
                ))}
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default BudgetCostsDetail;
