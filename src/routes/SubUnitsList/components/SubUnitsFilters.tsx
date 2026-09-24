import { Stack } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormComponent } from '@core/components/FormComponent';
import { OrgSubUnitStatus } from '@generated/core/data-contracts';
import { SubUnitType } from '@generated/core/client';

export const SubUnitsFilters = ({
  clearFilters
}: {
  clearFilters: () => void;
}) => {
  const { t } = useTranslation();
  const { control } = useFormContext();

  const statusSelect = Object.values(OrgSubUnitStatus).map((status) => ({
    label: t(`subunits.status.${status}`),
    value: status
  }));

  const typeSelect = Object.values(SubUnitType).map((type) => ({
    label: type,
    value: type
  }));

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems="center"
      spacing={2}
    >
      <FormComponent.ControlledTextField
        name="subUnitCode"
        control={control}
        label={t('subunits.list.filters.subUnitCode')}
      />
      <FormComponent.ControlledSelect
        name="subUnitType"
        sx={{ textTransform: 'capitalize' }}
        control={control}
        options={typeSelect}
        label={t('subunits.list.filters.subUnitType')}
      />
      <FormComponent.ControlledSelect
        name="status"
        control={control}
        options={statusSelect}
        label={t('commons.state')}
      />
      <Stack
        width="100%"
        direction="row"
        gap={1}
        justifyContent="flex-end"
        alignItems="center"
      >
        <FormComponent.Button
          label={t('commons.filters.filterResults')}
          size="small"
          type="submit"
          key="applyFilters"
        />
        <FormComponent.Button
          label={t('commons.filters.remove')}
          variant="naked"
          size="small"
          key="clearFilters"
          onClick={clearFilters}
        />
      </Stack>
    </Stack>
  );
};
