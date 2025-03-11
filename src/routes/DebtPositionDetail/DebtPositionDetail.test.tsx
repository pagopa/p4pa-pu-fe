import { screen, fireEvent } from '@testing-library/react';
import DebtPositionDetail from './DebtPositionDetail';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { render } from '../../__tests__/renderers';
import { mockData } from './mocks/apiResponse';

beforeEach(() => {
  i18nTestSetup({
    'commons.debtor': 'Debtor',
    'commons.fiscalCodeorVat': 'Fiscal Code/VAT',
    'commons.duetype': 'Due Type',
    'commons.internalCode': 'Internal Code',
    'commons.paymentOptions.oneOffPayment': 'One-off Payment',
    'commons.paymentOptions.multiplePayments': 'Multiple Payments',
    'commons.description': 'Description',
    'commons.amount': 'Amount',
    'commons.paid': 'Paid',
    'commons.unpaid': 'Unpaid',
    'debtPositionDetail.debtPositionInfo': 'Debt Position Info',
    'debtPositionDetail.paymentOptions': 'Payment Options',
    'debtPositionDetail.solutionDetail': 'Solution Detail',
    'DebtPositions.Results.status.PAID': 'Paid',
    'DebtPositions.Results.status.UNPAID': 'Unpaid',
    'DebtPositions.Results.status.REPORTED': 'Reported'
  });
});

describe('DebtPositionDetail Component', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with correct title and debt position status chip', () => {
    render(<DebtPositionDetail />);
    
    const titleElement = screen.getAllByText(mockData.debtPositionTypeOrgDescription)
      .find(element => element.tagName.toLowerCase() === 'h3');
    expect(titleElement).toBeDefined();
    
    const statusChips = screen.getAllByText('Reported');
    const chipElement = statusChips[0].closest('.MuiChip-root');
    expect(chipElement).not.toBeNull();
    expect(chipElement).toHaveClass('MuiChip-colorInfo');
  });

  it('expands debt position info accordion when clicked', async () => {
    render(<DebtPositionDetail />);
    
    const accordionSummary = screen.getByText('Debt Position Info');
    expect(accordionSummary).toBeDefined();
    
    const button = accordionSummary.closest('[role="button"]');
    expect(button).not.toBeNull();
    
    if (button) {
      fireEvent.click(button);
      
      await vi.waitFor(() => {
        expect(screen.getByText('Debtor')).toBeDefined();
        expect(screen.getByText('Mario Rossi')).toBeDefined();
        expect(screen.getByText('Fiscal Code/VAT')).toBeDefined();
        expect(screen.getByText(/ABCDEF12G34H567I/)).toBeDefined();
      }, { timeout: 2000 });
    }
  });

  it('renders both single and multiple payment options', () => {
    render(<DebtPositionDetail />);
    
    expect(screen.getByText('Payment Options')).toBeDefined();
    
    const singleInstallments = mockData.paymentOptions.filter(option => 
      option.paymentOptionType === 'SINGLE_INSTALLMENT'
    );
    
    const multipleInstallments = mockData.paymentOptions.filter(option => 
      option.paymentOptionType === 'INSTALLMENTS'
    );
    
    const sectionTitles = screen.getAllByText('Solution Detail');
    expect(sectionTitles.length).toBe(singleInstallments.length + multipleInstallments.length);
    
    const tables = screen.getAllByRole('grid');
    expect(tables.length).toBe(singleInstallments.length + multipleInstallments.length);
  });

  it('correctly processes and groups payment options by type', () => {
    render(<DebtPositionDetail />);
    
    const singleInstallmentOption = mockData.paymentOptions.find(
      option => option.paymentOptionType === 'SINGLE_INSTALLMENT'
    );
    
    if (singleInstallmentOption) {
      expect(screen.getAllByText('One-off Payment').length).toBeGreaterThan(0);
      
      const statusChip = screen.getAllByText('Reported').find(
        element => element.closest('.MuiChip-root')
      );
      expect(statusChip).toBeDefined();
    }
    
    const multipleInstallmentsOption = mockData.paymentOptions.find(
      option => option.paymentOptionType === 'INSTALLMENTS'
    );
    
    if (multipleInstallmentsOption) {
      expect(screen.getAllByText('Multiple Payments').length).toBeGreaterThan(0);
      
      const statusChip = screen.getAllByText('Reported').find(
        element => element.closest('.MuiChip-root')
      );
      expect(statusChip).toBeDefined();
    }
  });

  it('correctly maps installment data for display', async () => {
    render(<DebtPositionDetail />);
    
    const allIUVs = mockData.paymentOptions.flatMap(option => 
      option.installments.map(installment => installment.iuv)
    );
    
    for (const iuv of allIUVs) {
      const iuvElements = screen.getAllByText(iuv);
      expect(iuvElements.length).toBeGreaterThan(0);
    }
    
    const unpaidInstallments = mockData.paymentOptions.flatMap(option => 
      option.installments.filter(installment => installment.status === 'UNPAID')
    );
    
    const reportedInstallments = mockData.paymentOptions.flatMap(option => 
      option.installments.filter(installment => installment.status === 'REPORTED')
    );
    
    const unpaidChips = screen.getAllByText('Unpaid');
    expect(unpaidChips.length).toBe(unpaidInstallments.length);
    
    const reportedChips = screen.getAllByText('Reported');
    expect(reportedChips.length).toBeGreaterThanOrEqual(reportedInstallments.length);
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

  it('correctly handles entity type display in debtor info', async () => {
    render(<DebtPositionDetail />);
    
    const accordionSummary = screen.getByText('Debt Position Info');
    const button = accordionSummary.closest('[role="button"]');
    
    if (button) {
      fireEvent.click(button);
      
      await vi.waitFor(() => {
        const fiscalCodeText = screen.getByText(/ABCDEF12G34H567I/);
        expect(fiscalCodeText.textContent).toContain('(Persona fisica)');
      }, { timeout: 2000 });
    }
  });

  it('correctly handles multiple installments in the data grid', () => {
    render(<DebtPositionDetail />);
    
    const multipleOption = mockData.paymentOptions.find(
      option => option.paymentOptionType === 'INSTALLMENTS'
    );
    
    if (multipleOption) {
      for (const installment of multipleOption.installments) {
        const iuvElements = screen.getAllByText(installment.iuv);
        expect(iuvElements.length).toBeGreaterThan(0);
      }
      
      const shouldShowFooter = multipleOption.installments.length > 5;
      
      if (shouldShowFooter) {
        const paginationElement = screen.queryByRole('navigation');
        expect(paginationElement).not.toBeNull();
      } else {
        const paginationElement = screen.queryByRole('navigation');
        expect(paginationElement).toBeNull();
      }
    }
  });
});
