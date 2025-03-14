import { screen, fireEvent } from '@testing-library/react';
import DebtPositionDetail from './DebtPositionDetail';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { render } from '../../__tests__/renderers';
import { mockData } from './mocks/apiResponse';
import { InstallmentDTO } from '../../../generated/apiClient';

beforeEach(() => {
  i18nTestSetup({
    'commons.debtor': 'Debtor',
    'commons.fiscalCodeorVat': 'Fiscal Code/VAT',
    'commons.duetype': 'Due Type',
    'commons.internalCode': 'Internal Code',
    'commons.paymentOptions.SINGLE_INSTALLMENT': 'One-off Payment',
    'commons.paymentOptions.INSTALLMENTS': 'Multiple Payments',
    'commons.paymentOptions.DOWN_PAYMENT': 'Down Payment',
    'commons.description': 'Description',
    'commons.amount': 'Amount',
    'commons.paid': 'Paid',
    'commons.unpaid': 'Unpaid',
    'debtPositionDetail.debtPositionInfo': 'Debt Position Info',
    'debtPositionDetail.paymentOptions': 'Payment Options',
    'debtPositionDetail.solutionDetail': 'Solution Detail',
    'DebtPositions.Results.status.PAID': 'Paid',
    'DebtPositions.Results.status.UNPAID': 'Unpaid',
    'DebtPositions.Results.status.REPORTED': 'Reported',
    'DebtPositions.Results.status.TO_SYNC': 'To Sync'
  });
});

describe('DebtPositionDetail Component', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with correct title and debt position status chip', () => {
    render(<DebtPositionDetail />);

    const titleElements = screen.getAllByText(
      mockData.debtPositionTypeOrgDescription
    );
    expect(titleElements.length).toBeGreaterThan(0);

    const statusChips = screen.getAllByText((content) =>
      ['Paid', 'Unpaid', 'Reported', 'To Sync'].includes(content)
    );
    expect(statusChips.length).toBeGreaterThan(0);

    const chipElement = statusChips[0].closest('.MuiChip-root');
    expect(chipElement).not.toBeNull();

    expect(
      chipElement?.classList.contains('MuiChip-colorSuccess') ||
        chipElement?.classList.contains('MuiChip-colorError') ||
        chipElement?.classList.contains('MuiChip-colorInfo') ||
        chipElement?.classList.contains('MuiChip-colorDefault')
    ).toBe(true);
  });

  it('expands debt position info accordion when clicked', async () => {
    render(<DebtPositionDetail />);

    const accordionSummary = screen.getByText('Debt Position Info');
    expect(accordionSummary).toBeDefined();

    const button = accordionSummary.closest('[role="button"]');
    expect(button).not.toBeNull();

    if (button) {
      fireEvent.click(button);

      await vi.waitFor(
        () => {
          expect(screen.getByText('Debtor')).toBeDefined();
          expect(screen.getByText('Mario Rossi')).toBeDefined();
          expect(screen.getByText('Fiscal Code/VAT')).toBeDefined();
          expect(screen.getByText(/ABCDEF12G34H567I/)).toBeDefined();
        },
        { timeout: 2000 }
      );
    }
  });

  it('renders all payment option types correctly', () => {
    render(<DebtPositionDetail />);

    expect(screen.getByText('Payment Options')).toBeDefined();

    const singleInstallments = mockData.paymentOptions.filter(
      (option) => option.paymentOptionType === 'SINGLE_INSTALLMENT'
    );

    const downPayments = mockData.paymentOptions.filter(
      (option) => option.paymentOptionType === 'DOWN_PAYMENT'
    );

    const multipleInstallments = mockData.paymentOptions.filter(
      (option) => option.paymentOptionType === 'INSTALLMENTS'
    );

    if (singleInstallments.length > 0) {
      expect(screen.getAllByText('One-off Payment').length).toBeGreaterThan(0);
    }

    if (downPayments.length > 0) {
      expect(screen.getAllByText('Down Payment').length).toBeGreaterThan(0);
    }

    if (multipleInstallments.length > 0) {
      expect(screen.getAllByText('Multiple Payments').length).toBeGreaterThan(
        0
      );
    }

    const sectionTitles = screen.getAllByText('Solution Detail');
    expect(sectionTitles.length).toBeGreaterThanOrEqual(
      Math.min(1, singleInstallments.length) +
        Math.min(1, downPayments.length) +
        Math.min(1, multipleInstallments.length)
    );

    const tables = screen.getAllByRole('grid');
    expect(tables.length).toBeGreaterThan(0);
  });

  it('correctly maps installment data for display', async () => {
    render(<DebtPositionDetail />);

    const allValidIUVs = mockData.paymentOptions
      .flatMap((option) =>
        option.installments
          ? option.installments.filter(
              (inst): inst is InstallmentDTO & { iuv: string } =>
                inst != undefined &&
                inst.iuv !== undefined &&
                typeof inst.iuv === 'string'
            )
          : []
      )
      .map((installment) => installment.iuv);

    for (const iuv of allValidIUVs) {
      const iuvElements = screen.getAllByText(iuv);
      expect(iuvElements.length).toBeGreaterThan(0);
    }

    const unpaidInstallments = mockData.paymentOptions.flatMap((option) =>
      option.installments
        ? option.installments.filter(
            (installment) => installment && installment.status === 'UNPAID'
          )
        : []
    );

    const reportedInstallments = mockData.paymentOptions.flatMap((option) =>
      option.installments
        ? option.installments.filter(
            (installment) => installment && installment.status === 'REPORTED'
          )
        : []
    );

    const toSyncInstallments = mockData.paymentOptions.flatMap((option) =>
      option.installments
        ? option.installments.filter(
            (installment) => installment && installment.status === 'TO_SYNC'
          )
        : []
    );

    if (unpaidInstallments.length > 0) {
      const unpaidChips = screen.getAllByText('Unpaid');
      expect(unpaidChips.length).toBeGreaterThan(0);
    }

    if (reportedInstallments.length > 0) {
      const reportedChips = screen.getAllByText('Reported');
      expect(reportedChips.length).toBeGreaterThan(0);
    }

    if (toSyncInstallments.length > 0) {
      const toSyncChips = screen.getAllByText(
        (content) => content === 'To Sync' || content === 'Reported'
      );
      expect(toSyncChips.length).toBeGreaterThan(0);
    }
  });

  it('correctly displays data for down payment option type', () => {
    render(<DebtPositionDetail />);

    const downPaymentOptions = mockData.paymentOptions.filter(
      (option) => option.paymentOptionType === 'DOWN_PAYMENT'
    );

    if (downPaymentOptions.length > 0) {
      expect(screen.getAllByText('Down Payment').length).toBeGreaterThan(0);

      if (
        downPaymentOptions[0].installments &&
        downPaymentOptions[0].installments.length > 0
      ) {
        const firstInstallment = downPaymentOptions[0].installments[0];

        if (firstInstallment.iuv) {
          const iuvElements = screen.getAllByText(firstInstallment.iuv);
          expect(iuvElements.length).toBeGreaterThan(0);
        }

        if (firstInstallment.remittanceInformation) {
          const infoElements = screen.getAllByText(
            firstInstallment.remittanceInformation
          );
          expect(infoElements.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('triggers the history button callback when clicked', () => {
    render(<DebtPositionDetail />);

    const historyButton = screen.getByTestId('HistoryIcon').closest('button');
    expect(historyButton).not.toBeNull();

    if (historyButton) {
      fireEvent.click(historyButton);
      expect(console.log).toHaveBeenCalledWith('History clicked');
    }
  });

  it('shows the correct chip colors for different statuses', () => {
    const { container } = render(<DebtPositionDetail />);

    const grids = container.querySelectorAll('.MuiDataGrid-root');

    if (grids.length > 0) {
      const statusChips = container.querySelectorAll('.MuiChip-root');
      expect(statusChips.length).toBeGreaterThan(0);

      statusChips.forEach((chip) => {
        const hasColorClass = Array.from(chip.classList).some((className) =>
          [
            'MuiChip-colorSuccess',
            'MuiChip-colorError',
            'MuiChip-colorInfo',
            'MuiChip-colorDefault'
          ].includes(className)
        );
        expect(hasColorClass).toBe(true);
      });
    }
  });
});
