import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as router from 'react-router';
import * as debtPositionTypesHook from '../../hooks/useDebtPositionTypesByOrg';
import * as organizationOperatorsApi from '../../api/organizationOperators';
import * as useSearchHook from '../../hooks/useSearch';
import { PageRoutes } from '..';
import utils from '../../utils';
import { OperatorAffiliate } from '.';

// Mock react-i18next for translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ children }: { children: string }) => (
    <span data-testid="trans">{children}</span>
  )
}));

// Mock react-router hooks
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: vi.fn(),
  useNavigate: vi.fn()
}));

// Mock hooks and utils
vi.mock('../../hooks/useDebtPositionTypesByOrg');
vi.mock('../../api/organizationOperators');
vi.mock('../../hooks/useSearch');
vi.mock('../../utils/dialog');
vi.mock('../../utils/notify');

describe('OperatorAffiliate', () => {
  const mockedUseNavigate = router.useNavigate as Mock;
  const mockedUseParams = router.useParams as Mock;
  const mockedUseDebtPositionTypesByOrg =
    debtPositionTypesHook.useDebtPositionTypesByOrg as Mock;
  const mockedUseOperatorSearch =
    organizationOperatorsApi.useOperatorDebtPositionTypeOrgSearch as Mock;
  const mockedUseEnableAffiliate =
    organizationOperatorsApi.useEnbleDebtPositionTypeOrgsForOperator as Mock;
  const mockedUseSearch = useSearchHook.useSearch as Mock;

  const mockNavigate = vi.fn();
  const mutateAsyncMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseNavigate.mockReturnValue(mockNavigate);
    mockedUseParams.mockReturnValue({
      organizationId: '1',
      mappedExternalUserId: 'user1',
      operatorName: 'John Doe',
      orgName: 'OrgX'
    });

    mockedUseDebtPositionTypesByOrg.mockReturnValue({
      data: { optionsMap: [{ label: 'Label1', value: 'val1' }] }
    });

    mockedUseOperatorSearch.mockReturnValue({
      mutate: vi.fn(),
      data: {
        content: [
          {
            debtPositionTypeOrgId: 101,
            debtPositionTypeOrgDescription: 'desc1',
            code: 'code1',
            description: 'desc1'
          }
        ],
        totalPages: 1
      }
    });

    mockedUseEnableAffiliate.mockReturnValue({ mutateAsync: mutateAsyncMock });

    mockedUseSearch.mockReturnValue({
      query: {
        data: {
          content: [
            {
              debtPositionTypeOrgId: 101,
              debtPositionTypeOrgDescription: 'desc1',
              code: 'code1',
              description: 'desc1'
            }
          ],
          totalPages: 1
        }
      },
      applyFilters: vi.fn()
    });

    (utils.dialog.open as Mock).mockImplementation(vi.fn());
    (utils.dialog.close as Mock).mockImplementation(vi.fn());
    (utils.notify.emit as Mock).mockImplementation(vi.fn());
  });

  it('renders main UI elements', () => {
    render(<OperatorAffiliate />);
    expect(
      screen.getByText('OperatorDetail.affiliate.title')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('commons.searchForDescription')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('commons.searchForCode')).toBeInTheDocument();
    expect(
      screen.getByText('commons.filters.filterResults')
    ).toBeInTheDocument();
    expect(screen.getByText('commons.affiliate')).toBeInTheDocument();
  });

  it('redirects if invalid params', () => {
    mockedUseParams.mockReturnValueOnce({
      organizationId: 'NaN',
      mappedExternalUserId: ''
    });

    render(<OperatorAffiliate />);
    expect(mockNavigate).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
  });

  it('calls applyFilters when filter button clicked', () => {
    const mockApplyFilters = vi.fn();
    mockedUseSearch.mockReturnValueOnce({
      query: { data: { content: [], totalPages: 1 } },
      applyFilters: mockApplyFilters
    });

    render(<OperatorAffiliate />);
    fireEvent.click(screen.getByText('commons.filters.filterResults'));
    expect(mockApplyFilters).toHaveBeenCalled();
  });

  it('opens confirmation dialog and submits on confirm', async () => {
    mutateAsyncMock.mockResolvedValueOnce({});
    render(<OperatorAffiliate />);

    // First, select some items by checking the checkboxes
    const checkbox1 = screen.getAllByRole('gridcell')[1];

    fireEvent.click(checkbox1);

    // Now click the affiliate button
    fireEvent.click(screen.getByText('commons.affiliate'));

    // Now the dialog should open since we have selections
    expect(utils.dialog.open).toHaveBeenCalledOnce();
    const dialogArgs = (utils.dialog.open as Mock).mock.calls[0][0];

    // Simulate confirming the dialog
    await dialogArgs.onConfirm();

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      debtPositionTypeOrgIds: [101]
    });
    expect(mockNavigate).toHaveBeenCalledWith(
      PageRoutes.RESPONSES_SUCCESS,
      expect.objectContaining({
        replace: true,
        state: expect.objectContaining({
          category: 'operator-affiliate',
          i18nParams: expect.objectContaining({
            count: 1,
            operatorName: 'John Doe'
          })
        })
      })
    );
    expect(utils.dialog.close).toHaveBeenCalled();
  });

  it('shows notification if no selection on affiliate submit', () => {
    render(<OperatorAffiliate />);
    fireEvent.click(screen.getByText('commons.affiliate'));
    expect(utils.notify.emit).toHaveBeenCalledWith(
      'OperatorDetail.affiliate.noSelection'
    );
  });
});
