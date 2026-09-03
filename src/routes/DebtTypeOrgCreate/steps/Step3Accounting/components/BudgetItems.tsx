import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import TableRowsIcon from '@mui/icons-material/TableRows';
import { Stack, Typography } from '@mui/material';
import { DebtTypeOrgForm } from '@core/routes/DebtTypeOrgCreate/types';
import { DebtPositionTypeOrgBalanceCostType } from '@generated/data-contracts';
import SectionBox from '@core/components/Wizard/SectionBox';
import { FormComponent } from '@core/components/FormComponent';
import { CostConfiguration } from './CostConfiguration';

export const BudgetItems = ({ edit }: { edit?: boolean }) => {
  const { t } = useTranslation();
  const { control } = useFormContext<DebtTypeOrgForm>();

  const { fields } = useFieldArray({
    control,
    name: 'debtPositionTypeOrgBalanceCostRequestList'
  });

  const balanceCosts = useWatch({
    control,
    name: 'debtPositionTypeOrgBalanceCostRequestList'
  });

  const balanceCostTypes = Object.values(DebtPositionTypeOrgBalanceCostType);

  return (
    <SectionBox
      title={t('debtTypeOrgCreate.accounting.section.specificBudgetItems')}
      adornment={<TableRowsIcon />}
      subtitle={t('debtTypeOrgCreate.accounting.budget.subtitle')}
    >
      <Stack gap={3}>
        {fields.map((field, index) => {
          const showYear = index % balanceCostTypes.length === 0;

          const isEnabled = balanceCosts?.[index]?.enabled ?? false;

          const isReadOnly = edit && field?.readOnly;

          return (
            <Stack key={field.id} gap={2}>
              {showYear && (
                <Typography variant="subtitle1" fontWeight={600}>
                  {t('debtTypeOrgCreate.accounting.budget.year', {
                    year: field.operatingYear
                  })}
                </Typography>
              )}

              <Stack gap={2} ml={1}>
                <FormComponent.ControlledSwitch
                  disabled={isReadOnly}
                  name={`debtPositionTypeOrgBalanceCostRequestList.${index}.enabled`}
                  control={control}
                  label={t(`debtTypeOrgCreate.accounting.budget.${field.type}`)}
                  data-testid={`accountingCost.${index}`}
                />

                {isEnabled && (
                  <CostConfiguration index={index} disabled={isReadOnly} />
                )}
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </SectionBox>
  );
};
