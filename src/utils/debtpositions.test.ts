import { describe, it, expect } from 'vitest';
import { DebtPositionOrigin } from '../../generated/core/client';
import { isTechnicalDebtPosition } from './debtpositions';

describe('isTechnicalDebtPosition', () => {
  it('should return true for all technical debt position origins', () => {
    const technicalValues = [
      DebtPositionOrigin.SECONDARY_ORG,
      DebtPositionOrigin.RECEIPT_FILE,
      DebtPositionOrigin.RECEIPT_PAGOPA,
      DebtPositionOrigin.REPORTING_PAGOPA
    ];

    technicalValues.forEach((value) => {
      expect(isTechnicalDebtPosition(value)).toBe(true);
    });
  });

  it('should return false for non-technical debt position origins', () => {
    const nonTechnicalValue = 'OTHER_ORIGIN' as DebtPositionOrigin;

    expect(isTechnicalDebtPosition(nonTechnicalValue)).toBe(false);
  });
});
