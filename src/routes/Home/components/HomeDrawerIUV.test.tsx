import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../__tests__/renderers';
import userEvent from '@testing-library/user-event';
import { HomeDrawerIUV } from './HomeDrawerIUV';
import { DashboardByIuv } from '../../../../generated/data-contracts';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';

const mockDownloadReceipt = vi.fn();
vi.mock('../../TelematicReceiptDetail/useReceiptDownload', () => ({
  useReceiptDownload: () => ({ downloadReceipt: mockDownloadReceipt })
}));

const mockNavigate = vi.fn();
vi.mock('../../../hooks/useAppNavigation', () => ({
  useAppNavigate: () => mockNavigate
}));

describe('HomeDrawerIUV', () => {
  const baseResults: DashboardByIuv = {
    hasInstallment: false,
    hasDebtPosition: false,
    hasReceipt: false,
    hasIuf: false,
    hasClassification: false
  } as DashboardByIuv;

  beforeEach(() => {
    vi.clearAllMocks();
    i18nTestSetup({
      'home.drawer.installment': 'Visualizza dettaglio Avviso',
      'home.drawer.installments': 'Visualizza dettaglio Avvisi',
      'home.drawer.debtPosition': 'Visualizza Posizione Debitoria',
      'home.drawer.debtPositions': 'Visualizza Posizioni Debitorie',
      'home.drawer.receipt': 'Scarica Ricevuta Telematica',
      'home.drawer.reportings': 'Visualizza le rendicontazioni',
      'home.drawer.reporting': 'Visualizza rendicontazione',
      'home.drawer.classifications': 'Verifica lo stato dei pagamenti',
      'home.drawer.classification': 'Verifica lo stato del pagamento'
    });
  });

  it('downloads receipt when receiptId is present', async () => {
    const results: DashboardByIuv = {
      ...baseResults,
      hasReceipt: true,
      receiptId: 999
    } as DashboardByIuv;

    render(<HomeDrawerIUV searchValue="IUV123" searchResults={results} />);

    const item = await screen.findByText('Scarica Ricevuta Telematica');
    await userEvent.click(item);
    expect(mockDownloadReceipt).toHaveBeenCalledWith({ receiptId: 999 });
  });

  it('navigates to receipts list when multiple receipts (no receiptId)', async () => {
    const results: DashboardByIuv = {
      ...baseResults,
      hasReceipt: true,
      receiptId: undefined
    } as DashboardByIuv;

    render(<HomeDrawerIUV searchValue="IUV123" searchResults={results} />);
    const item = await screen.findByText('Scarica Ricevuta Telematica');
    await userEvent.click(item);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('navigates to installment detail when installmentId exists', async () => {
    const results: DashboardByIuv = {
      ...baseResults,
      hasInstallment: true,
      installmentId: 11
    } as DashboardByIuv;

    render(<HomeDrawerIUV searchValue="IUV123" searchResults={results} />);
    const item = await screen.findByText('Visualizza dettaglio Avviso');
    await userEvent.click(item);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('navigates to DP detail when debtPositionId exists', async () => {
    const results: DashboardByIuv = {
      ...baseResults,
      hasDebtPosition: true,
      debtPositionId: 22
    } as DashboardByIuv;

    render(<HomeDrawerIUV searchValue="IUV123" searchResults={results} />);
    const item = await screen.findByText('Visualizza Posizione Debitoria');
    await userEvent.click(item);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('navigates to reporting detail when iuf exists, otherwise to list', async () => {
    const withIuf: DashboardByIuv = {
      ...baseResults,
      hasIuf: true,
      iuf: 'IUF123'
    } as DashboardByIuv;

    render(<HomeDrawerIUV searchValue="IUV123" searchResults={withIuf} />);
    const item1 = await screen.findByText('Visualizza rendicontazione');
    await userEvent.click(item1);
    expect(mockNavigate).toHaveBeenCalled();

    const noIuf: DashboardByIuv = {
      ...baseResults,
      hasIuf: true,
      iuf: undefined
    } as DashboardByIuv;

    render(<HomeDrawerIUV searchValue="IUV123" searchResults={noIuf} />);
    const item2 = await screen.findByText('Visualizza le rendicontazioni');
    await userEvent.click(item2);
    expect(mockNavigate).toHaveBeenCalledTimes(2);
  });

  it('navigates to classification detail when classificationId exists, otherwise to list', async () => {
    const withCls: DashboardByIuv = {
      ...baseResults,
      hasClassification: true,
      classificationId: 333
    } as DashboardByIuv;

    render(<HomeDrawerIUV searchValue="IUV123" searchResults={withCls} />);
    const item1 = await screen.findByText('Verifica lo stato del pagamento');
    await userEvent.click(item1);
    expect(mockNavigate).toHaveBeenCalled();

    const noCls: DashboardByIuv = {
      ...baseResults,
      hasClassification: true,
      classificationId: undefined
    } as DashboardByIuv;

    render(<HomeDrawerIUV searchValue="IUV123" searchResults={noCls} />);
    const item2 = await screen.findByText('Verifica lo stato dei pagamenti');
    await userEvent.click(item2);
    expect(mockNavigate).toHaveBeenCalledTimes(2);
  });
});
