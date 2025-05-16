import { useEffect, useState } from 'react';
import { DebtPositionTypeOrg } from '../../generated/apiClient';
import { useTranslation } from 'react-i18next';
import { DebtPositionType } from '../models/DebtPositionType';
import utils from '../utils';
import { getDebtPositionTypeOrgs } from '../api/debtPositionsTypeOrg';

export const useDebtPositionsTypeOrg = ({
  organizationId,
  includeAllOption = true
}: {
  organizationId: number;
  includeAllOption?: boolean;
}) => {
  const [debtPositionsTypes, setDebtPositionsTypes] = useState<
    Array<DebtPositionType>
  >([]);
  const { t } = useTranslation();

  const debtPositionsTypesQuery = getDebtPositionTypeOrgs({
    organizationId
  });

  const { data, isLoading, isError, isSuccess } = debtPositionsTypesQuery;

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

      setDebtPositionsTypes(
        includeAllOption
          ? [
              {
                label: t('commons.all'),
                value: 0,
                flagMandatoryDueDate: false
              },
              ...dueTypesMap
            ]
          : dueTypesMap
      );
    }

    if (isError) {
      utils.notify.emit(t('errors.fetchDebtPositionsTypes'), 'error');
    }
  }, [data, isLoading, isError, isSuccess, t, includeAllOption]);

  return { optionsMap: debtPositionsTypes, ...debtPositionsTypesQuery };
};
