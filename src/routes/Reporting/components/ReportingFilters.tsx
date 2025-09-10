import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import Stack from '@mui/material/Stack';
import { useFormContext } from 'react-hook-form';
import { ErrorMessage } from '../../../components/ErrorMessage/ErrorMessage';
import { FormComponent } from '../../../components/FormComponent';
import { FilterFieldIds } from '../../../models/SearchCardFields';

type ReportingFiltersProps = {
  layout?: 'inline' | 'grid';
  error?: boolean;
};

export const ReportingFilters = ({
  layout = 'inline',
  error
}: ReportingFiltersProps) => {
  const { t } = useTranslation();
  const { control } = useFormContext();
  return (
    <Stack gap={2}>
      {error && (
        <ErrorMessage variant={layout === 'inline' ? 'outlined' : 'standard'} />
      )}
      <Stack
        direction={layout === 'inline' ? 'row' : 'column'}
        spacing={2}
        width="100%"
      >
        <FormComponent.ControlledTextField
          name="iuf"
          control={control}
          label={t('commons.searchIUF')}
          adornment={<SearchIcon />}
          sx={{ flex: 0.3 }}
          key={FilterFieldIds.IUF}
          required={false}
        />
        <FormComponent.ControlledTextField
          name="regulationUniqueIdentifier"
          control={control}
          sx={{ flex: 0.3 }}
          label={t('commons.searchRegulationUniqueIdentifier')}
          adornment={<SearchIcon />}
          key={FilterFieldIds.REGULATION_UNIQUE_IDENTIFIER}
          required={false}
        />
        <Stack sx={{ flex: 0.4 }}>
          <FormComponent.ControlledDateRange
            name="dateRange"
            control={control}
            key={FilterFieldIds.DATE_RANGE}
            from={{ label: t('reporting.regulationFrom') }}
            to={{ label: t('commons.to') }}
          />
        </Stack>
        {layout === 'inline' && (
          <FormComponent.Button
            label={t('commons.filters.filterResults')}
            sx={{ flex: 0.1 }}
            type="submit"
            key="applyFilters"
          />
        )}
      </Stack>
    </Stack>
  );
};
