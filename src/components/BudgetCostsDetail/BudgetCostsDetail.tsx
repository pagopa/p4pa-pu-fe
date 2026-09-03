import { useEffect, useId, useRef, useState } from 'react';
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
} from '../../../generated/core/client';

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

  const baseId = useId();
  const tabId = (year: string) => `budget-tab-${baseId}-${year}`;
  const panelId = (year: string) => `budget-panel-${baseId}-${year}`;

  // On year change move focus to the panel so screen readers announce the
  // updated content (WAI-ARIA tabs pattern). Skip the initial mount.
  const panelRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);
  useEffect(() => {
    if (isMountedRef.current) {
      panelRef.current?.focus();
    } else {
      isMountedRef.current = true;
    }
  }, [activeYear]);

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
          <Tab
            key={year}
            value={year}
            label={year}
            id={tabId(year)}
            aria-controls={panelId(year)}
            aria-label={t(
              'debtTypeOrgCreate.accounting.budgetCost.yearTabLabel',
              {
                year
              }
            )}
          />
        ))}
      </Tabs>

      <Box
        role="tabpanel"
        id={panelId(activeYear)}
        aria-labelledby={tabId(activeYear)}
        tabIndex={0}
        ref={panelRef}
      >
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
                          {t(
                            `debtTypeOrgCreate.accounting.budgetCost.${field}`
                          )}
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
    </Box>
  );
};

export default BudgetCostsDetail;
