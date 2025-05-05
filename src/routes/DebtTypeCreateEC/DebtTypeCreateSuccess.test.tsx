import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { DebtTypeCreateSuccess } from './DebtTypeCreateSuccess';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      if (key === 'debtTypeCreateSuccess.title' && options?.paymentObject) {
        return `${key} ${options.paymentObject}`;
      }
      return key;
    }
  })
}));

const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: {
      formData: {
        description: 'Test Debt Type'
      }
    }
  })
}));

vi.mock('@pagopa/mui-italia', () => ({
  theme: {
    palette: {
      success: {
        main: '#00FF00'
      }
    },
    spacing: (val: number) => `${val * 8}px`
  }
}));

vi.mock('../../App', () => ({
  PageRoutes: {
    DEBT_TYPES_CATALOG: '/debt-types-catalog'
  }
}));

describe('DebtTypeCreateSuccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders success message with correct debt type name', async () => {
    render(<DebtTypeCreateSuccess />);

    // Verify the success icon is displayed
    expect(screen.getByTestId('CheckCircleOutlineIcon')).toBeInTheDocument();

    // Verify the title includes the debt type name from location state
    await waitFor(() => {
      expect(
        screen.getByText('debtTypeCreateSuccess.title Test Debt Type')
      ).toBeInTheDocument();
    });

    // Verify the description is displayed
    expect(
      screen.getByText('debtTypeCreateSuccess.description')
    ).toBeInTheDocument();
  });

  it('navigates to catalog when button is clicked', () => {
    render(<DebtTypeCreateSuccess />);

    // Find and click the button
    const button = screen.getByRole('button', {
      name: 'debtTypeCreateSuccess.backToStart'
    });
    fireEvent.click(button);

    // Verify navigation was called with the correct route
    expect(mockNavigate).toHaveBeenCalledWith('/debt-types-catalog');
  });

  it('renders with correct styling', () => {
    const { container } = render(<DebtTypeCreateSuccess />);

    // Check for main container
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      textAlign: 'center'
    });

    // Check for inner container
    const innerContainer = container.querySelector('div > div');
    expect(innerContainer).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    });

    // Check icon styling
    const icon = screen.getByTestId('CheckCircleOutlineIcon');
    expect(icon).toHaveStyle({
      fontSize: '64px',
      color: '#00FF00',
      borderRadius: '50%'
    });
  });
});
