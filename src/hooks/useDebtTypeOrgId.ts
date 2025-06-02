import { useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import utils from '../utils';

export const useDebtTypeOrgId = (edit?: boolean) => {
  const params = useParams<{ debtPositionTypeOrgId: string }>();
  const { t } = useTranslation();

  const debtPositionTypeOrgId = useMemo(() => {
    const id = params.debtPositionTypeOrgId;
    return id ? Number(id) : undefined;
  }, [params.debtPositionTypeOrgId]);

  useEffect(() => {
    if (edit && !debtPositionTypeOrgId) {
      utils.notify.emit(t('errors.generic'));
    }
  }, [edit, debtPositionTypeOrgId, t]);

  return debtPositionTypeOrgId;
};
