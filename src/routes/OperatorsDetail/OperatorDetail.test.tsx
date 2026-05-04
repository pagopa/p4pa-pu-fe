import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render, screen, fireEvent } from '../../__tests__/renderers';
import OperatorDetail from '../OperatorsDetail';

// Mock react-router hooks
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: vi.fn(),
  useNavigate: vi.fn()
}));

// Mock other hooks and modules
vi.mock('../../hooks/useDebtPositionTypesByOrg', () => ({
  useDebtPositionTypesByOrg: vi.fn()
}));
vi.mock('../../api/organizationOperators', () => ({
  useOperatorDetailSearch: vi.fn()
}));
vi.mock('../../hooks/useSearch', () => ({
  useSearch: vi.fn()
}));
vi.mock('./hooks/useBreadcrumbs', () => ({
  useBreadcrumbs: vi.fn()
}));

// Import after mocks
import { useParams, useNavigate } from 'react-router';
import { useDebtPositionTypesByOrg } from '../../hooks/useDebtPositionTypesByOrg';
import { useOperatorDetailSearch } from '../../api/organizationOperators';
import { useSearch } from '../../hooks/useSearch';
import { useBreadcrumbs } from './hooks/useBreadcrumbs';
import { PageRoutes } from '..';

describe('OperatorDetail Component', () => {
  const mockUseParams = useParams as Mock;
  const mockUseNavigate = useNavigate as Mock;
  const mockUseDebtPositionTypesByOrg = useDebtPositionTypesByOrg as Mock;
  const mockUseOperatorDetailSearch = useOperatorDetailSearch as Mock;
  const mockUseSearch = useSearch as Mock;
  const mockUseBreadcrumbs = useBreadcrumbs as Mock;

  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup react-router mocks
    mockUseParams.mockReturnValue({
      organizationId: '123',
      mappedExternalUserId: 'abc-xyz'
    });
    mockUseNavigate.mockReturnValue(mockNavigate);

    // Setup debtPositionTypes mock
    mockUseDebtPositionTypesByOrg.mockReturnValue({
      data: {
        optionsMap: [{ label: 'Type A', value: 'a' }]
      }
    });

    // Setup operator search hook mock
    mockUseOperatorDetailSearch.mockReturnValue({
      mutate: vi.fn(),
      data: {
        content: [
          {
            debtPositionTypeOrgId: 1,
            code: 'CODE',
            debtPositionTypeDescription: 'Desc',
            description: 'Desc'
          }
        ],
        totalPages: 1
      }
    });

    // Setup useSearch mock with data and applyFilters
    mockUseSearch.mockReturnValue({
      query: {
        isError: false,
        error: null,
        data: {
          pagedDebtPositionTypeOrg: {
            content: [
              {
                debtPositionTypeOrgId: 1,
                code: 'CODE',
                debtPositionTypeDescription: 'Desc',
                description: 'Desc'
              }
            ],
            totalPages: 1
          },
          operatorId: 'operator-1',
          operatorName: 'John',
          operatorLastName: 'Doe',
          operatorRole: 'admin',
          operatorFiscalCode: 'XYZ123'
        },
        isSuccess: true
      },
      applyFilters: vi.fn()
    });

    // Mock breadcrumbs to no-op
    mockUseBreadcrumbs.mockImplementation(() => null);
  });

  it('renders operator details title with operator name', () => {
    render(<OperatorDetail />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders filters and data grid', () => {
    render(<OperatorDetail />);
    expect(
      screen.getByLabelText('commons.searchForDescription')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('commons.searchForCode')).toBeInTheDocument();
    expect(screen.getByText('OperatorDetail.code')).toBeInTheDocument();
  });

  it('navigates to error page if there are api errors', () => {
    mockUseSearch.mockReturnValue({
      query: {
        isError: true,
        isSuccess: false,
        error: 'error',
        data: null
      },
      applyFilters: vi.fn()
    });
    render(<OperatorDetail />);
    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
  });

  it('calls applyFilters when clicking filter button', () => {
    const filteredMock = vi.fn();
    mockUseSearch.mockReturnValue({
      query: {
        isError: false,
        error: null,
        data: { pagedDebtPositionTypeOrg: { content: [], totalPages: 0 } },
        isSuccess: true
      },
      applyFilters: filteredMock
    });
    render(<OperatorDetail />);
    const button = screen.getByText('commons.filters.filterResults');
    fireEvent.click(button);
    expect(filteredMock).toHaveBeenCalled();
  });
});
