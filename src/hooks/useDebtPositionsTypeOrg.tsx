import { useEffect, useState } from 'react';
import { DebtPositionTypeOrg } from '../../generated/apiClient';
import { SelectProps } from '../components/FormComponent';
import { useTranslation } from 'react-i18next';
import { getDebtPositionsTypes } from '../api/debtPositionsTypes';

export const useDebtPositionsTypeOrg = ({
  organizationId
}: {
  organizationId: number;
}) => {
  const [debtPositionsTypes, setDebtPositionsTypes] = useState<
    SelectProps['options']
  >([]);
  const { t } = useTranslation();

  const debtPositionsTypesQuery = getDebtPositionsTypes({
    organizationId
  });

  const { data, isLoading, isError, isSuccess, error } =
    debtPositionsTypesQuery;

  useEffect(() => {
    if (isSuccess && data) {
      const dueTypesMap = data
        .filter(
          (type: DebtPositionTypeOrg) =>
            type?.description && type?.debtPositionTypeOrgId
        )
        .map((type) => ({
          label: type.description ?? '',
          value: type.debtPositionTypeOrgId ?? 0
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      setDebtPositionsTypes([
        { label: t('commons.all'), value: 0 },
        ...dueTypesMap
      ]);
    }

    if (isError) {
      // TODO: Handle error (e.g., show a toast)
      console.error('Failed to fetch fe config', error);
    }
  }, [data, isLoading, isError, isSuccess]);

  return { optionsMap: debtPositionsTypes, ...debtPositionsTypesQuery };
};
