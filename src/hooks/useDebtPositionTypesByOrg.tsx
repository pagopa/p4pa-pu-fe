import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import utils from '../utils';
import { getDebtPositionTypesByOrganizationId } from '../api/debtPositionsTypes';
import { DebtPositionType } from '../../generated/data-contracts';
import { SelectOptions } from '../components/FormComponent/_Select';

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

  const { data, isLoading, isError, isSuccess } = debtPositionsTypesQuery;

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
      utils.notify.emit(t('errors.fetchDebtPositionsTypes'), 'error');
    }
  }, [data, isLoading, isError, isSuccess, t]);

  return { optionsMap: debtPositionsTypes, ...debtPositionsTypesQuery };
};
