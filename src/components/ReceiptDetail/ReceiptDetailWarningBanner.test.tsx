import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ReceiptDetailWarningBanner from './ReceiptDetailWarningBanner';
import { ReceiptDetailDTO } from '../../../generated/apiClient';

describe('ReceiptDetailWarningBanner', () => {
  const idAlertBanner = 'technical-debt-alert';

  it('does not show the warning Banner', () => {
    const { container } = render(
      <ReceiptDetailWarningBanner
        receiptOrigin={'RECEIPT_PAGOPA' as ReceiptDetailDTO['receiptOrigin']}
        debtPositionOrigin={
          'ORDINARY' as ReceiptDetailDTO['debtPositionOrigin']
        }
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('shows the warning Banner when receiptOrigin != RECEIPT_PAGOPA', () => {
    render(
      <ReceiptDetailWarningBanner
        receiptOrigin={'RECEIPT_FILE' as ReceiptDetailDTO['receiptOrigin']}
        debtPositionOrigin={
          'ORDINARY' as ReceiptDetailDTO['debtPositionOrigin']
        }
      />
    );

    const alert = screen.getByTestId(idAlertBanner);
    expect(alert).toBeInTheDocument();
  });

  it('shows the warning Banner when debtPositionOrigin == SECONDARY_ORG', () => {
    render(
      <ReceiptDetailWarningBanner
        receiptOrigin={'RECEIPT_PAGOPA' as ReceiptDetailDTO['receiptOrigin']}
        debtPositionOrigin={
          'SECONDARY_ORG' as ReceiptDetailDTO['debtPositionOrigin']
        }
      />
    );

    const alert = screen.getByTestId(idAlertBanner);
    expect(alert).toBeInTheDocument();
  });

  it('should use custom style on wrapper box', () => {
    const customSx = { marginTop: '20px' };
    render(
      <ReceiptDetailWarningBanner
        receiptOrigin={'RECEIPT_PAGOPA' as ReceiptDetailDTO['receiptOrigin']}
        debtPositionOrigin={
          'SECONDARY_ORG' as ReceiptDetailDTO['debtPositionOrigin']
        }
        sx={customSx}
      />
    );

    const alert = screen.getByTestId(idAlertBanner);
    expect(alert.parentElement?.parentElement).toBeInTheDocument();
  });
});
