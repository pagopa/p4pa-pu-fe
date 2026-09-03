import { DebtPositionOrigin } from '../../generated/core/client';

/**
 *
 * @param debtPositionOrigin
 * @returns If the debtPositionOrigin has a "technical" value, then returns true
 */
export const isTechnicalDebtPosition = (
  debtPositionOrigin: DebtPositionOrigin
): boolean => {
  const technicalCodes: Array<DebtPositionOrigin> = [
    DebtPositionOrigin.SECONDARY_ORG,
    DebtPositionOrigin.RECEIPT_FILE,
    DebtPositionOrigin.RECEIPT_PAGOPA,
    DebtPositionOrigin.REPORTING_PAGOPA
  ];
  return technicalCodes.includes(debtPositionOrigin);
};

export default {
  isTechnicalDebtPosition
};
