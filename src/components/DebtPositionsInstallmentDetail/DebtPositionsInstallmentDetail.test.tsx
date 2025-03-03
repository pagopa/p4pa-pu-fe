import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DebtPositionsInstallmentDetail, tmpMockData } from './DebtPositionsInstallmentDetail';
import { DetailData } from '../DetailContainer/DetailContainer';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('DebtPositionsInstallmentDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders DebtPositionsInstallmentDetail correctly', () => {
    render(<DebtPositionsInstallmentDetail />);
    expect(screen.getByText('installmentDetailPage.title')).toBeInTheDocument();
    expect(screen.getByText('Saldo Tari 2025')).toBeInTheDocument();
    expect(screen.getByText('commons.chipStaus.PAID')).toBeInTheDocument();
  });

  it('shows payment details for PAID debt', () => {
    (tmpMockData as Record<string, DetailData[]>).summaryData = (tmpMockData as Record<string, DetailData[]>).summaryData.map((item: DetailData) => 
      item.label === 'Stato' ? { ...item, value: 'PAID' } : item
    );
    render(<DebtPositionsInstallmentDetail />);
    expect(screen.queryByText('installmentDetailPage.paymentInformation')).toBeInTheDocument();
    expect(screen.queryByText('installmentDetailPage.noPaymentMade')).toBeNull();
  });

  it('shows EmptyDetailContainer for UNPAID debt', () => {
    (tmpMockData as Record<string, DetailData[]>).summaryData = (tmpMockData as Record<string, DetailData[]>).summaryData.map((item: DetailData) => 
      item.label === 'Stato' ? { ...item, value: 'UNPAID' } : item
    );
    render(<DebtPositionsInstallmentDetail />);
    expect(screen.queryByText('installmentDetailPage.noPaymentMade')).toBeInTheDocument();
    expect(screen.queryByText('installmentDetailPage.paymentInformation')).toBeNull();
  });

});