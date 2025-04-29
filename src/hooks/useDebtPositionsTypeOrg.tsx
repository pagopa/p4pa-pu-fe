import { useEffect, useState } from 'react';
import { DebtPositionTypeOrg } from '../../generated/apiClient';
import { useTranslation } from 'react-i18next';
import { getDebtPositionsTypes } from '../api/debtPositionsTypes';
import { DebtPositionType } from '../models/DebtPositionType';

export const useDebtPositionsTypeOrg = ({
  organizationId
}: {
  organizationId: number;
}) => {
  const [debtPositionsTypes, setDebtPositionsTypes] = useState<
    Array<DebtPositionType>
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
            type?.description && type?.debtPositionTypeOrgId !== undefined
        )
        .sort((a, b) => a.description.localeCompare(b.description))
        .map((type: DebtPositionTypeOrg) => ({
          label: type.description,
          value: type.debtPositionTypeOrgId as number,
          flagMandatoryDueDate: type.flagMandatoryDueDate
        }));

      setDebtPositionsTypes([
        {
          label: t('commons.all'),
          value: 0,
          flagMandatoryDueDate: false
        },
        ...dueTypesMap
      ]);
    }

    if (isError) {
      // TODO: Handle error (e.g., show a toast)
      console.error('Failed to fetch fe config', error);
    }
  }, [data, isLoading, isError, isSuccess, t]);

  return { optionsMap: debtPositionsTypes, ...debtPositionsTypesQuery };
};
