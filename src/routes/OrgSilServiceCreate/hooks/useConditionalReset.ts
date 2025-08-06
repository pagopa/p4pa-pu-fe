import { useEffect } from 'react';
import { UseFormResetField, UseFormWatch } from 'react-hook-form';
import { OrgSilServiceFormData } from '../schema';
import {
  BASIC_AUTH_FIELDS,
  JWT_AUTH_FIELDS,
  ALL_AUTH_FIELDS,
  type AuthFieldName
} from '../utils/orgSilServiceFormUtils';

type UseConditionalResetProps = {
  watch: UseFormWatch<OrgSilServiceFormData>;
  resetField: UseFormResetField<OrgSilServiceFormData>;
};

export const useConditionalReset = ({
  watch,
  resetField
}: UseConditionalResetProps) => {
  if (!watch || !resetField) {
    return {
      watchFlagLegacy: undefined,
      watchAuthConfigType: undefined
    };
  }

  const watchFlagLegacy = watch('flagLegacy');
  const watchAuthConfigType = watch('authConfigType');

  useEffect(() => {
    if (!watchFlagLegacy) {
      (ALL_AUTH_FIELDS as ReadonlyArray<AuthFieldName>).forEach((field) =>
        resetField(field)
      );
      return;
    }

    switch (watchAuthConfigType) {
      case 'basic':
        (JWT_AUTH_FIELDS as ReadonlyArray<AuthFieldName>).forEach((field) =>
          resetField(field)
        );
        break;
      case 'jwt':
        (BASIC_AUTH_FIELDS as ReadonlyArray<AuthFieldName>).forEach((field) =>
          resetField(field)
        );
        break;
      default:
        (
          [
            ...BASIC_AUTH_FIELDS,
            ...JWT_AUTH_FIELDS
          ] as ReadonlyArray<AuthFieldName>
        ).forEach((field) => resetField(field));
        break;
    }
  }, [watchFlagLegacy, watchAuthConfigType, resetField]);

  return {
    watchFlagLegacy,
    watchAuthConfigType
  };
};
