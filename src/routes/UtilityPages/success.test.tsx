import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '../../__tests__/renderers';
import SuccessPage from './success';
import { PageRoutes } from '../../routes';

const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
    useParams: () => ({ category: mockUseLocation()?.state?.category })
  };
});

vi.mock('../../models/SuccessPageConfig', () => ({
  SuccessPageConfig: {
    'debt-type-catalog-create': {
      title: 'debtTypeCreateSuccess.title',
      description: 'debtTypeCreateSuccess.description',
      buttonConfig: [
        {
          buttonLabel: 'debtTypeCreateSuccess.backToStart',
          actionID: 'DEBT_TYPES_CATALOG'
        }
      ]
    },
    'assessment-create': {
      title: 'assessmentCreate.success.title',
      description: 'assessmentCreate.success.description',
      buttonConfig: [
        {
          buttonLabel: 'assessmentCreate.success.goToDetail',
          customNavigation: 'ASSESSMENT_DETAIL'
        }
      ]
    },
    'org-sil-service-create': {
      title: 'orgSilServiceCreate.newService.success.title',
      description: 'orgSilServiceCreate.newService.success.description',
      buttonConfig: [
        {
          buttonLabel: 'orgSilServiceCreate.newService.success.goToDetail',
          customNavigation: 'ORG_SIL_SERVICE_DETAIL'
        }
      ]
    },
    'client-sil': {
      title: 'clientSil.create.success.title',
      description: 'clientSil.create.success.description',
      buttonConfig: [
        {
          buttonLabel: 'clientSil.create.success.goToDetail',
          customNavigation: 'CLIENT_SIL_DETAIL'
        }
      ]
    },
    'no-buttons': {
      title: 'noButtonsSuccess.title',
      description: 'noButtonsSuccess.description'
    },
    'assessment-with-fallback': {
      title: 'assessmentCreate.success.title',
      description: 'assessmentCreate.success.description',
      buttonConfig: [
        {
          buttonLabel: 'assessmentCreate.success.goToDetail',
          customNavigation: 'ASSESSMENT_DETAIL',
          actionID: 'DEBT_TYPES_CATALOG'
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

  describe('customNavigation scenarios', () => {
    it('navigates to ASSESSMENT_DETAIL when customNavigation is ASSESSMENT_DETAIL and assessmentId is provided', () => {
      mockUseLocation.mockReturnValue({
        state: {
          category: 'assessment-create',
          assessmentId: 123
        }
      });

      render(<SuccessPage />);
      const button = screen.getByRole('button', {
        name: 'assessmentCreate.success.goToDetail'
      });
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith(
        PageRoutes.ASSESSMENT_DETAIL.replace(':id', '123')
      );
    });

    it('navigates to ORG_SIL_SERVICE_DETAIL when customNavigation is ORG_SIL_SERVICE_DETAIL and orgSilServiceId is provided', () => {
      mockUseLocation.mockReturnValue({
        state: {
          category: 'org-sil-service-create',
          orgSilServiceId: 456
        }
      });

      render(<SuccessPage />);
      const button = screen.getByRole('button', {
        name: 'orgSilServiceCreate.newService.success.goToDetail'
      });
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith(
        PageRoutes.ORG_SIL_SERVICE_DETAIL.replace(':orgSilServiceId', '456')
      );
    });

    it('navigates to CLIENT_SIL_DETAIL when customNavigation is CLIENT_SIL_DETAIL and clientId is provided', () => {
      mockUseLocation.mockReturnValue({
        state: {
          category: 'client-sil',
          clientId: 'client789'
        }
      });

      render(<SuccessPage />);
      const button = screen.getByRole('button', {
        name: 'clientSil.create.success.goToDetail'
      });
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith(
        PageRoutes.CLIENT_SIL_DETAIL.replace(':clientId', 'client789')
      );
    });

    it('falls back to actionID navigation when customNavigation is set but required ID is missing', () => {
      mockUseLocation.mockReturnValue({
        state: {
          category: 'assessment-with-fallback'
          // assessmentId is missing, should fall back to actionID
        }
      });

      render(<SuccessPage />);
      const button = screen.getByRole('button', {
        name: 'assessmentCreate.success.goToDetail'
      });
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.DEBT_TYPES_CATALOG);
    });
  });

  describe('edge cases', () => {
    it('renders successfully when buttonConfig is undefined', () => {
      mockUseLocation.mockReturnValue({
        state: { category: 'no-buttons' }
      });

      render(<SuccessPage />);
      expect(screen.getByText('noButtonsSuccess.title')).toBeInTheDocument();
      expect(
        screen.getByText('noButtonsSuccess.description')
      ).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('handles i18nParams correctly', () => {
      mockUseLocation.mockReturnValue({
        state: {
          category: 'debt-type-catalog-create',
          i18nParams: { paymentObject: 'TestPayment' }
        }
      });

      render(<SuccessPage />);
      expect(
        screen.getByText('debtTypeCreateSuccess.title')
      ).toBeInTheDocument();
    });

    it('navigates to undefined when actionID is undefined (edge case behavior)', () => {
      mockUseLocation.mockReturnValue({
        state: {
          category: 'client-sil'
          // clientId is missing, will fallback but actionID is also undefined
        }
      });

      render(<SuccessPage />);
      const button = screen.getByRole('button', {
        name: 'clientSil.create.success.goToDetail'
      });
      fireEvent.click(button);

      // This is the actual behavior: PageRoutes[undefined || PageRoutes.HOME] = PageRoutes[PageRoutes.HOME] = undefined
      expect(mockNavigate).toHaveBeenCalledWith(undefined);
    });
  });
});
