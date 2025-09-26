import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OperatorAffiliate } from '.'; // Adjust import path if needed
import * as router from 'react-router';
import * as debtPositionTypesHook from '../../hooks/useDebtPositionTypesByOrg';
import * as organizationOperatorsApi from '../../api/organizationOperators';
import * as useSearchHook from '../../hooks/useSearch';
import { PageRoutes } from '..';
import utils from '../../utils';

// Mock react-router hooks
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
  useParams: vi.fn()
}));

// Mock hooks and utils modules
vi.mock('../../hooks/useDebtPositionTypesByOrg');
vi.mock('../../api/organizationOperators');
vi.mock('../../hooks/useSearch');
vi.mock('../../utils/dialog');
vi.mock('../../utils/notify');

describe('OperatorAffiliate component', () => {
  const mockedUseNavigate = router.useNavigate as unknown as ReturnType<
    typeof vi.fn
  >;
  const mockedUseParams = router.useParams as unknown as ReturnType<
    typeof vi.fn
  >;
  const mockedUseDebtPositionTypesByOrg =
    debtPositionTypesHook.useDebtPositionTypesByOrg as unknown as ReturnType<
      typeof vi.fn
    >;
  const mockedUseOperatorSearch =
    organizationOperatorsApi.useOperatorDebtPositionTypeOrgSearch as unknown as ReturnType<
      typeof vi.fn
    >;
  const mockedUseEnableAffiliate =
    organizationOperatorsApi.useEnbleDebtPositionTypeOrgsForOperator as unknown as ReturnType<
      typeof vi.fn
    >;
  const mockedUseSearch = useSearchHook.useSearch as unknown as ReturnType<
    typeof vi.fn
  >;

  const navigateMock = vi.fn();
  const mutateAsyncMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup router mocks
    mockedUseNavigate.mockReturnValue(navigateMock);
    mockedUseParams.mockReturnValue({
      organizationId: '1',
      mappedExternalUserId: 'user1',
      operatorName: 'John Doe',
      orgName: 'OrgX'
    });

    // Setup hook mocks
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

    // utils mocks - spy on dialog and notify methods
    (
      utils.dialog.open as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation(vi.fn());
    (
      utils.dialog.close as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation(vi.fn());
    (
      utils.notify.emit as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation(vi.fn());
  });

  it('renders key UI elements', () => {
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

  it('redirects to error page when invalid params', () => {
    mockedUseParams.mockReturnValueOnce({
      organizationId: 'NaN',
      mappedExternalUserId: ''
    });
    render(<OperatorAffiliate />);
    expect(navigateMock).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR);
  });

  it('calls applyFilters when filter button clicked', () => {
    const applyFiltersMock = vi.fn();

    mockedUseSearch.mockReturnValue({
      query: { data: { content: [], totalPages: 1 } },
      applyFilters: applyFiltersMock
    });

    render(<OperatorAffiliate />);
    fireEvent.click(screen.getByText('commons.filters.filterResults'));
    expect(applyFiltersMock).toHaveBeenCalled();
  });

  it('opens confirmation dialog and submits on confirm', async () => {
    // Pretend the selected codes length is non-zero by simulating selection
    mutateAsyncMock.mockResolvedValueOnce({});

    render(<OperatorAffiliate />);

    // Select one debt position by clicking first checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    if (checkboxes.length > 1) {
      fireEvent.click(checkboxes[1]);
    }

    fireEvent.click(screen.getByText('commons.affiliate'));

    expect(utils.dialog.open).toHaveBeenCalledOnce();
    const dialogArgs = (
      utils.dialog.open as unknown as ReturnType<typeof vi.fn>
    ).mock.calls[0][0];

    await dialogArgs.onConfirm();

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      debtPositionTypeOrgIds: expect.arrayContaining([101])
    });
    expect(navigateMock).toHaveBeenCalledWith(
      PageRoutes.RESPONSES_SUCCESS,
      expect.anything()
    );
    expect(utils.dialog.close).toHaveBeenCalled();
  });

  it('emits notification if no selection on submit', () => {
    render(<OperatorAffiliate />);
    fireEvent.click(screen.getByText('commons.affiliate'));
    expect(utils.notify.emit).toHaveBeenCalledWith(
      'OperatorDetail.affiliate.noSelection'
    );
  });
});
