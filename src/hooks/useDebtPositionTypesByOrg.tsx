import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import utils from '../utils';
import { getDebtPositionTypesByOrganizationId } from '../api/debtPositionsTypes';
import { DebtPositionType } from '../../generated/data-contracts';
import { SelectOptions } from '../components/FormComponent/_Select';
import { AxiosError } from 'axios';

export const useDebtPositionTypesByOrg = ({
  organizationId
}: {
  organizationId: number;
}) => {
  const [debtPositionsTypes, setDebtPositionsTypes] = useState<SelectOptions>(
    []
  );
  const { t } = useTranslation();

  const debtPositionsTypesQuery = getDebtPositionTypesByOrganizationId({
    organizationId
  });

  const { data, isError, isSuccess } = debtPositionsTypesQuery;

  useEffect(() => {
    if (isSuccess && data) {
      const dueTypesMap = [...data]
        .sort((a, b) => a.description.localeCompare(b.description))
        .map((type: DebtPositionType) => ({
          label: type.description,
          value: type.debtPositionTypeId
        }));

      setDebtPositionsTypes(dueTypesMap);
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
