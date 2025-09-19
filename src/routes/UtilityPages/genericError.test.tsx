import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '../../__tests__/renderers';
import GenericErrorPage from './genericError';
import { PageRoutes } from '../../routes';

const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation()
  };
});

vi.mock('../../../models/ErrorPageConfig', () => ({
  ErrorPageConfig: {
    defaultOptions: {
      title: 'utilityPages.genericError.title',
      description: 'utilityPages.genericError.description',
      buttonConfig: [
        {
          buttonLabel: 'commons.back',
          actionID: 'HOME'
        }
      ]
    }
  }
}));

describe('GenericErrorPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('renders title and description', () => {
    render(<GenericErrorPage />);
    expect(
      screen.getByText('utilityPages.genericError.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('utilityPages.genericError.description')
    ).toBeInTheDocument();
  });

  it('calls navigate on button click', () => {
    render(<GenericErrorPage />);
    const button = screen.getByRole('button', {
      name: 'commons.back'
    });
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.HOME);
  });
});
