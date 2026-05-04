import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import utils from '../utils';
import { getDebtPositionTypesByOrganizationId } from '../api/debtPositionsTypes';
import { AxiosError } from 'axios';

export const useDebtPositionTypesByOrg = ({
  organizationId
}: {
  organizationId: number;
}) => {
  const { t } = useTranslation();

  const query = getDebtPositionTypesByOrganizationId({
    organizationId
  });

  useEffect(() => {
    if (query.isError) {
      const error = query.error as AxiosError;
      const isServerError =
        error?.response?.status && error.response.status >= 500;

      if (!isServerError) {
        utils.notify.emit(t('errors.fetchDebtPositionsTypes'), 'error');
      }
    }
  }, [query.isError, t, query.error]);

  return query;
};
