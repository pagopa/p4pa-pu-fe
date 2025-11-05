import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../__tests__/renderers';
import userEvent from '@testing-library/user-event';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { HomeDrawerFC } from './HomeDrawerFC';
import { DashboardByFc } from '../../../../generated/data-contracts';

const mockDownloadReceipt = vi.fn();
vi.mock('../../TelematicReceiptDetail/useReceiptDownload', () => ({
  useReceiptDownload: () => ({ downloadReceipt: mockDownloadReceipt })
}));

const mockNavigate = vi.fn();
vi.mock('../../../hooks/useAppNavigation', () => ({
  useAppNavigate: () => mockNavigate
}));

describe('HomeDrawerFC', () => {
  const baseResults: DashboardByFc = {
    hasInstallment: false,
    hasDebtPosition: false,
    hasReceipt: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    i18nTestSetup({
      'home.drawer.receipt': 'Scarica Ricevuta Telematica',
      'home.drawer.receipts': 'Visualizza Ricevute Telematiche',
      'home.drawer.installment': 'Visualizza dettaglio Avviso',
      'home.drawer.installments': 'Visualizza dettaglio Avvisi',
      'home.drawer.debtPosition': 'Visualizza Posizione Debitoria'
    });
  });

  it('shows receipt item as download when receiptId is present', async () => {
    const searchResults: DashboardByFc = {
      ...baseResults,
      hasReceipt: true,
      receiptId: 123
    };

    render(
      <HomeDrawerFC
        searchValue="RSSMRA80A01H501U"
        searchResults={searchResults}
      />
    );

    // Click on receipt item triggers download
    const receiptItem = await screen.findByText('Scarica Ricevuta Telematica');
    await userEvent.click(receiptItem);
    expect(mockDownloadReceipt).toHaveBeenCalledWith({ receiptId: 123 });

    // Action icon should be download (right chevron replaced by download)
    // We check by role text since the icon has no role; presence of label is enough here
  });

  it('shows receipt item as visit when multiple receipts (no receiptId)', async () => {
    const searchResults: DashboardByFc = {
      ...baseResults,
      hasReceipt: true,
      receiptId: undefined
    };

    render(
      <HomeDrawerFC
        searchValue="RSSMRA80A01H501U"
        searchResults={searchResults}
      />
    );

    // Label should be plural and clicking navigates to search results with hash
    const pluralItem = await screen.findByText(
      'Visualizza Ricevute Telematiche'
    );
    await userEvent.click(pluralItem);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('navigates to installment and debt position when ids are present', async () => {
    const searchResults: DashboardByFc = {
      hasInstallment: true,
      installmentId: 11,
      hasDebtPosition: true,
      debtPositionId: 22,
      hasReceipt: false
    };

    render(
      <HomeDrawerFC
        searchValue="RSSMRA80A01H501U"
        searchResults={searchResults}
      />
    );

    const installmentItem = await screen.findByText(
      'Visualizza dettaglio Avviso'
    );
    await userEvent.click(installmentItem);
    expect(mockNavigate).toHaveBeenCalled();

    const dpItem = await screen.findByText('Visualizza Posizione Debitoria');
    await userEvent.click(dpItem);
    expect(mockNavigate).toHaveBeenCalledTimes(2);
  });

  it('navigates to installments list when no installmentId but hasInstallment', async () => {
    const searchResults: DashboardByFc = {
      ...baseResults,
      hasInstallment: true,
      installmentId: undefined
    };

    render(
      <HomeDrawerFC
        searchValue="RSSMRA80A01H501U"
        searchResults={searchResults}
      />
    );

    const listItem = await screen.findByText('Visualizza dettaglio Avvisi');
    await userEvent.click(listItem);
    expect(mockNavigate).toHaveBeenCalled();
  });
});
