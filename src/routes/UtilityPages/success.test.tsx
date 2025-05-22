import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '../../__tests__/renderers';
import SuccessPage from './success';
import { PageRoutes } from '../../App';

const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom'
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
    useParams: () => ({ category: mockUseLocation()?.state?.category })
  };
});

vi.mock('../../../models/ThankyouPage', () => ({
  ThankyouPageConfig: {
    'debt-type-catalog-create': {
      title: 'debtTypeCreateSuccess.title',
      description: 'debtTypeCreateSuccess.description',
      buttonConfig: [
        {
          buttonLabel: 'debtTypeCreateSuccess.backToStart',
          actionID: 'DEBT_TYPES_CREATED'
        }
      ]
    }
  }
}));

describe('SuccessPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('redirects to home if category is invalid', () => {
    mockUseLocation.mockReturnValue({
      state: { category: 'invalid-category' }
    });

    render(<SuccessPage />);
    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.HOME, {
      replace: true
    });
  });

  it('renders title and description if category is valid', () => {
    mockUseLocation.mockReturnValue({
      state: {
        category: 'debt-type-catalog-create',
        i18nParams: { paymentObject: 'TestObject' }
      }
    });

    render(<SuccessPage />);
    expect(screen.getByText('debtTypeCreateSuccess.title')).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeCreateSuccess.description')
    ).toBeInTheDocument();
  });

  it('calls navigate on button click', () => {
    mockUseLocation.mockReturnValue({
      state: {
        category: 'debt-type-catalog-create',
        i18nParams: { paymentObject: 'TestObject' }
      }
    });

    render(<SuccessPage />);
    const button = screen.getByRole('button', {
      name: 'debtTypeCreateSuccess.backToStart'
    });
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.DEBT_TYPES_CATALOG);
  });
});
