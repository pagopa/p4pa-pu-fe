import { screen, fireEvent } from '@testing-library/react';
import { PaymentOptionSection } from './PaymentOptionSection';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { render } from '../../../__tests__/renderers';
import { PaymentOptionDisplayData } from '../DebtPositionDetail';
import { PageRoutes } from '../../../App';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    createBrowserRouter: vi.fn()
  };
});

const mockOptionData: PaymentOptionDisplayData = {
  title: 'Test Payment Option',
  tag: 'Test Status',
  chip: { label: 'Test Status', color: 'info' },
  details: [
    { label: 'Description', value: 'Test Description' },
    { label: 'Amount', value: 5000 }
  ],
  installments: [
    {
      id: 1,
      iuv: 'TEST12345',
      subject: 'Test Installment',
      amount: 2500,
      expirationDate: '2025-12-31',
      status: 'Unpaid'
    },
    {
      id: 2,
      iuv: 'TEST67890',
      subject: 'Test Installment 2',
      amount: 2500,
      expirationDate: '2026-01-31',
      status: 'Reported'
    }
  ]
};

beforeEach(() => {
  i18nTestSetup({
    'commons.paid': 'Paid',
    'commons.unpaid': 'Unpaid',
    'debtPositionDetail.solutionDetail': 'Solution Detail'
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('PaymentOptionSection Component', () => {
  it('renders with the correct title and chip', () => {
    render(<PaymentOptionSection optionData={mockOptionData} />);

    expect(screen.getByText('Test Payment Option')).toBeDefined();

    const statusChip = screen.getByText('Test Status');
    expect(statusChip).toBeDefined();
    expect(statusChip.closest('.MuiChip-root')).not.toBeNull();
  });

  it('expands accordion when clicked', async () => {
    render(<PaymentOptionSection optionData={mockOptionData} />);

    const accordionSummary = screen.getByText('Solution Detail');
    expect(accordionSummary).toBeDefined();

    const button = accordionSummary.closest('[role="button"]');
    expect(button).not.toBeNull();

    if (button) {
      fireEvent.click(button);

      await vi.waitFor(
        () => {
          expect(screen.getByText('Description')).toBeDefined();
          expect(screen.getByText('Test Description')).toBeDefined();
        },
        { timeout: 2000 }
      );
    }
  });

  it('renders the data grid with correct installments', () => {
    render(<PaymentOptionSection optionData={mockOptionData} />);

    expect(screen.getByText('Codice Avviso (IUV)')).toBeDefined();
    expect(screen.getByText('Oggetto del pagamento')).toBeDefined();
    expect(screen.getByText('Importo')).toBeDefined();
    expect(screen.getByText('Data scadenza')).toBeDefined();
    expect(screen.getByText('Stato')).toBeDefined();

    expect(screen.getByText('TEST12345')).toBeDefined();
    expect(screen.getByText('TEST67890')).toBeDefined();
    expect(screen.getByText('Test Installment')).toBeDefined();
    expect(screen.getByText('Test Installment 2')).toBeDefined();
  });

  it('navigates to detail page with correct ID when ReadMore is clicked', () => {
    render(<PaymentOptionSection optionData={mockOptionData} />);

    const readMoreIcons = screen.getAllByTestId('ReadMoreIcon');
    expect(readMoreIcons.length).toBe(2);

    fireEvent.click(readMoreIcons[0]);
    expect(navigateMock).toHaveBeenCalledWith(
      PageRoutes.DEBT_POSITION_INSTALLMENT_DETAIL.replace(':id', '1'),
      {
        state: {
          remittanceInformation: undefined
        }
      }
    );

    navigateMock.mockClear();

    fireEvent.click(readMoreIcons[1]);
    expect(navigateMock).toHaveBeenCalledWith(
      PageRoutes.DEBT_POSITION_INSTALLMENT_DETAIL.replace(':id', '2'),
      {
        state: {
          remittanceInformation: undefined
        }
      }
    );
  });

  it('applies the correct status chip colors', () => {
    const mockWithDifferentStatuses: PaymentOptionDisplayData = {
      ...mockOptionData,
      installments: [
        {
          id: 1,
          iuv: 'TEST12345',
          subject: 'Test Paid',
          amount: 2500,
          expirationDate: '2025-12-31',
          status: 'Paid'
        },
        {
          id: 2,
          iuv: 'TEST67890',
          subject: 'Test Unpaid',
          amount: 2500,
          expirationDate: '2026-01-31',
          status: 'Unpaid'
        },
        {
          id: 3,
          iuv: 'TEST54321',
          subject: 'Test Other Status',
          amount: 2500,
          expirationDate: '2026-02-28',
          status: 'Other Status'
        }
      ]
    };

    render(<PaymentOptionSection optionData={mockWithDifferentStatuses} />);

    const statusChips = screen.getAllByText((content) => {
      return ['Paid', 'Unpaid', 'Other Status'].includes(content);
    });

    expect(statusChips.length).toBe(3);

    const paidChip = screen.getByText('Paid').closest('.MuiChip-root');
    expect(paidChip).toHaveClass('MuiChip-colorSuccess');

    const unpaidChip = screen.getByText('Unpaid').closest('.MuiChip-root');
    expect(unpaidChip).toHaveClass('MuiChip-colorError');

    const otherStatusChip = screen
      .getByText('Other Status')
      .closest('.MuiChip-root');
    expect(otherStatusChip).toHaveClass('MuiChip-colorInfo');
  });

  it('hides footer when installments length is 5 or less', () => {
    render(<PaymentOptionSection optionData={mockOptionData} />);

    const pagination = screen.queryByRole('navigation');
    expect(pagination).toBeNull();
  });

  it('shows footer when installments length is more than 5', () => {
    const mockWithManyInstallments: PaymentOptionDisplayData = {
      ...mockOptionData,
      installments: Array(6)
        .fill(0)
        .map((_, index) => ({
          id: index + 1,
          iuv: `TEST${index}`,
          subject: `Test Installment ${index + 1}`,
          amount: 1000,
          expirationDate: '2025-12-31',
          status: 'Unpaid'
        }))
    };

    render(<PaymentOptionSection optionData={mockWithManyInstallments} />);

    const pagination = screen.queryByRole('navigation');
    expect(pagination).not.toBeNull();
  });
});
