import { useEffect, useState } from 'react';
import debtPositions from '../api/debtPositions';
import { DebtPositionTypeOrg } from '../../generated/apiClient';
import { SelectProps } from '../components/FormComponent';
import { useTranslation } from 'react-i18next';

export const useDebtPositionsTypeOrg = ({ organizationId }: { organizationId: number }) => {
  const [debtPositionsTypes, setDebtPositionsTypes] = useState<SelectProps['options']>([]);
  const { t } = useTranslation();

  const debtPositionsTypesQuery = debtPositions.getDebtPositionsTypes({
    organizationId
  });

  const { data, isLoading, isError, isSuccess, error } = debtPositionsTypesQuery;

  useEffect(() => {
    if (isSuccess && data) {
      const dueTypesMap = data
        .filter((type: DebtPositionTypeOrg) => type?.description && type?.debtPositionTypeOrgId)
        .map((type) => ({
          label: type.description ?? '',
          value: type.debtPositionTypeOrgId ?? 0
        }));

      setDebtPositionsTypes([{ label: t('commons.all'), value: 'TUTTI' }, ...dueTypesMap]);
    }

    if (isError) {
      // TODO: Handle error (e.g., show a toast)
      console.error('Failed to fetch fe config', error);
    }
  }, [data, isLoading, isError, isSuccess]);

  return { optionsMap: debtPositionsTypes, ...debtPositionsTypesQuery };
};
