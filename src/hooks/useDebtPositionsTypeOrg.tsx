import { useEffect, useState } from 'react';
import { DebtPositionTypeOrg } from '../../generated/apiClient';
import { useTranslation } from 'react-i18next';
import { DebtPositionType } from '../models/DebtPositionType';
import utils from '../utils';
import { getDebtPositionTypeOrgs } from '../api/debtPositionsTypeOrg';
import { AxiosError } from 'axios';

export const useDebtPositionsTypeOrg = ({
  organizationId,
  includeAllOption = false,
  useCodeAsValue = false,
  filterActiveOnly = false
}: {
  organizationId: number;
  includeAllOption?: boolean;
  useCodeAsValue?: boolean;
  filterActiveOnly?: boolean;
}) => {
  const [debtPositionsTypes, setDebtPositionsTypes] = useState<
    Array<DebtPositionType>
  >([]);
  const { t } = useTranslation();

  const debtPositionsTypesQuery = getDebtPositionTypeOrgs({
    organizationId,
    flagActive: filterActiveOnly ? true : undefined
  });

  const { data, isError, isSuccess } = debtPositionsTypesQuery;

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
          value: useCodeAsValue
            ? type.code
            : (type.debtPositionTypeOrgId as number),
          flagMandatoryDueDate: type.flagMandatoryDueDate
        }));

      setDebtPositionsTypes(
        includeAllOption
          ? [
              {
                label: t('commons.all'),
                value: useCodeAsValue ? 'ALL' : 0,
                flagMandatoryDueDate: false
              },
              ...dueTypesMap
            ]
          : dueTypesMap
      );
    }

    if (isError) {
      const error = debtPositionsTypesQuery.error as AxiosError;
      const isServerError =
        error?.response?.status && error.response.status >= 500;

      if (!isServerError) {
        utils.notify.emit(t('errors.fetchDebtPositionsTypes'), 'error');
      }
    }
  }, [data, isError, isSuccess, t, debtPositionsTypesQuery.error]);

  return { optionsMap: debtPositionsTypes, ...debtPositionsTypesQuery };
};
