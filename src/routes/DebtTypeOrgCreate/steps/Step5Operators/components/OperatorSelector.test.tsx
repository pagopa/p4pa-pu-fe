/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor
} from '../../../../../__tests__/renderers';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import {
  OperatorsSelection,
  UserInfoDTO
} from '../../../../../../generated/core/data-contracts';
import * as api from '../../../../../api/debtPositionTypeOrgOperators';
import { OperatorSelector } from './OperatorSelector';
import { setUserInfo } from '../../../../../store/UserInfoStore';
import { expect, vi } from 'vitest';
import { useSearch } from '../../../../../hooks/useSearch';
import { useParams } from 'react-router';
import { DebtTypeOrgForm } from '../../../types';

type OperatorFixture = {
  mappedExternalUserId?: string;
  firstName?: string;
  lastName?: string;
};

const buildApiResponse = (
  content: Array<Record<string, unknown>>,
  number = 0
) => ({
  content,
  totalPages: 2,
  totalElements: 4,
  size: 2,
  number
});

const pageOneResponse = buildApiResponse([
  {
    mappedExternalUserId: 'op-1',
    operatorId: 'operator-1',
    firstName: 'John',
    lastName: 'Doe',
    enabled: true
  },
  {
    mappedExternalUserId: 'op-2',
    operatorId: 'operator-2',
    firstName: 'Jane',
    lastName: 'Smith',
    enabled: false
  },
  {
    mappedExternalUserId: 'default-op',
    operatorId: 'operator-3',
    firstName: 'Default',
    lastName: 'Operator',
    enabled: true
  }
]);

const pageTwoResponse = buildApiResponse(
  [
    {
      mappedExternalUserId: 'op-3',
      operatorId: 'operator-3',
      firstName: 'Alice',
      lastName: 'Johnson',
      enabled: false
    },
    {
      mappedExternalUserId: 'op-4',
      operatorId: 'operator-4',
      firstName: 'Bob',
      lastName: 'Taylor',
      enabled: true
    }
  ],
  1
);

const pageWithMissingLastName = buildApiResponse([
  {
    mappedExternalUserId: 'op-fallback',
    operatorId: 'operator-fallback',
    firstName: 'Fallback',
    lastName: '',
    enabled: false
  }
]);

const getOperatorDisplayName = (operator: OperatorFixture) =>
  `${operator.firstName || ''} ${
    operator.lastName || operator.mappedExternalUserId || ''
  }`.trim();

let currentApiResponse = pageOneResponse;

const mockMutateAsync = vi.fn(() => Promise.resolve());

const FormStateSpy = () => {
  const { watch } = useFormContext<DebtTypeOrgForm>();

  return (
    <pre data-testid="form-state">
      {JSON.stringify({
        enabledOperators: watch('enabledOperators') || [],
        disabledOperators: watch('disabledOperators') || [],
        operatorsSelection: watch('operatorsSelection')
      })}
    </pre>
  );
};

vi.mock('../../../../../hooks/useSearch', () => ({
  useSearch: vi.fn(() => ({
    query: {
      data: currentApiResponse,
      isLoading: false,
      mutateAsync: mockMutateAsync
    },
    applyFilters: vi.fn()
  }))
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useParams: vi.fn()
  };
});

// Spy on the API mock; return data synchronously as returned by useSearch
vi.spyOn(api, 'getDebtPositionTypeOrgOperators').mockImplementation(
  () =>
    ({
      data: currentApiResponse
    }) as any
);

const TestFormWrapper = ({
  children,
  defaultValues,
  showFormState = false
}: {
  children: React.ReactNode;
  defaultValues?: Partial<DebtTypeOrgForm>;
  showFormState?: boolean;
}) => {
  const methods = useForm<DebtTypeOrgForm>({
    defaultValues: {
      enabledOperators: [],
      disabledOperators: [],
      operatorsSelection: OperatorsSelection.SELECTED,
      ...defaultValues
    }
  });

  return (
    <FormProvider {...methods}>
      {children}
      {showFormState ? <FormStateSpy /> : null}
    </FormProvider>
  );
};

// Helper: render the component wrapped with RHF form context and optional edit mode
const renderWithProviders = ({
  edit,
  defaultValues,
  showFormState = false
}: {
  edit?: boolean;
  defaultValues?: Partial<DebtTypeOrgForm>;
  showFormState?: boolean;
} = {}) => {
  return render(
    <TestFormWrapper
      defaultValues={defaultValues}
      showFormState={showFormState}
    >
      <OperatorSelector edit={edit} />
    </TestFormWrapper>
  );
};

const getFormState = () =>
  JSON.parse(screen.getByTestId('form-state').textContent || '{}');

const rerenderWithResponse = (
  view: ReturnType<typeof render>,
  apiResponse: typeof currentApiResponse
) => {
  currentApiResponse = apiResponse;

  view.rerender(
    <TestFormWrapper>
      <OperatorSelector edit />
    </TestFormWrapper>
  );
};

describe('OperatorSelector component integration', () => {
  const mockedUseParams = vi.mocked(useParams);
  const mockedUseSearch = vi.mocked(useSearch);

  beforeEach(() => {
    // Reset mocks to a clean state before each test
    vi.clearAllMocks();
    setUserInfo(undefined);
    currentApiResponse = pageOneResponse;

    // Provide a default return value for useParams for tests in edit mode
    mockedUseParams.mockReturnValue({ debtPositionTypeOrgId: '123' });
  });

  it('renders operators and displays selection alert', async () => {
    renderWithProviders({ edit: true });

    // Wait for operators to be rendered by useSearch data
    await waitFor(() => {
      expect(
        screen.getByText(getOperatorDisplayName(pageOneResponse.content[0]))
      ).toBeInTheDocument();
      expect(
        screen.getByText(getOperatorDisplayName(pageOneResponse.content[1]))
      ).toBeInTheDocument();
      expect(
        screen.getByText(getOperatorDisplayName(pageOneResponse.content[2]))
      ).toBeInTheDocument();
    });

    // Alert shows selected count text (contains translation key as string)
    expect(screen.getByText(/commons.selectedOperator/)).toBeInTheDocument();

    // Delete Selection button also rendered
    expect(
      screen.getByRole('button', { name: 'commons.deleteSelection' })
    ).toBeInTheDocument();
  });

  it('disables row checkbox for default operator', async () => {
    // Set default operator user info mappedExternalUserId
    setUserInfo({
      mappedExternalUserId: 'default-op'
    } as UserInfoDTO);

    renderWithProviders({ edit: true });

    await waitFor(() => {
      expect(
        screen.getByText(getOperatorDisplayName(pageOneResponse.content[2]))
      ).toBeInTheDocument();
    });

    // Get checkboxes (exclude "Select All"; assumes basic structure)
    const checkboxes = screen.getAllByRole('checkbox');

    // Find checkbox corresponding to default-op row: last checkbox should be default operator row
    const defaultOperatorCheckbox = checkboxes[checkboxes.length - 1];
    expect(defaultOperatorCheckbox).toBeDisabled();
  });

  it('clears selection when Delete Selection button is clicked', async () => {
    renderWithProviders({ edit: true });

    // Wait until alert and button appear
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'commons.deleteSelection' })
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'commons.deleteSelection' })
    );

    // After clearing selection alert disappears (no selected operators)
    await waitFor(() => {
      expect(
        screen.queryByText(/commons.selectedOperator/)
      ).not.toBeInTheDocument();
    });
  });

  it('updates selection alert when selecting and deselecting operators', async () => {
    renderWithProviders({ edit: true });

    await waitFor(() => {
      expect(
        screen.getByText(getOperatorDisplayName(pageOneResponse.content[0]))
      ).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    // Assuming first checkbox is Select All, second checkbox corresponds to John Doe, third to Jane Smith, etc.
    const janeCheckbox = checkboxes[2];

    // Select the non-default operator in the current page.
    fireEvent.click(janeCheckbox);

    // Alert updates (now 2 selected)
    await waitFor(() => {
      expect(screen.getByText(/commons.selectedOperator/)).toBeInTheDocument();
    });
  });

  it('preserves selected operators when paginated results change', async () => {
    const view = renderWithProviders({ edit: true });

    await waitFor(() => {
      expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    });

    const pageOneCheckboxes = screen.getAllByRole('checkbox');
    const selectableOperatorOnPageOne = pageOneCheckboxes[2];

    fireEvent.click(selectableOperatorOnPageOne);

    await waitFor(() => {
      expect(selectableOperatorOnPageOne).toBeChecked();
    });

    rerenderWithResponse(view, pageTwoResponse);

    await waitFor(() => {
      expect(
        screen.getByText(getOperatorDisplayName(pageTwoResponse.content[1]))
      ).toBeInTheDocument();
      expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    });

    rerenderWithResponse(view, pageOneResponse);

    await waitFor(() => {
      expect(
        screen.getByText(getOperatorDisplayName(pageOneResponse.content[1]))
      ).toBeInTheDocument();
      expect(screen.getAllByRole('checkbox')[2]).toBeChecked();
    });
  });

  it('renders nothing when operators selection is not SELECTED', () => {
    renderWithProviders({
      edit: false,
      defaultValues: {
        operatorsSelection: OperatorsSelection.ALL
      }
    });

    expect(
      screen.queryByRole('button', { name: 'commons.deleteSelection' })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('preselects the default operator in create mode', async () => {
    setUserInfo({
      mappedExternalUserId: 'default-op'
    } as UserInfoDTO);
    mockedUseParams.mockReturnValue({});

    renderWithProviders({ edit: false, showFormState: true });

    await waitFor(() => {
      expect(
        screen.getByText(getOperatorDisplayName(pageOneResponse.content[2]))
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getFormState().enabledOperators).toEqual(['default-op']);
    });
  });

  it('clears disabled operators after a new selection in create mode', async () => {
    mockedUseParams.mockReturnValue({});

    renderWithProviders({
      edit: false,
      showFormState: true,
      defaultValues: {
        enabledOperators: [],
        disabledOperators: ['legacy-disabled'],
        operatorsSelection: OperatorsSelection.SELECTED
      }
    });

    await waitFor(() => {
      expect(
        screen.getByText(getOperatorDisplayName(pageOneResponse.content[1]))
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole('checkbox')[2]);

    await waitFor(() => {
      expect(getFormState().disabledOperators).toEqual([]);
      expect(getFormState().enabledOperators).toContain('op-2');
    });
  });

  it('falls back to mappedExternalUserId when lastName is missing', async () => {
    currentApiResponse = pageWithMissingLastName;

    renderWithProviders({ edit: true });

    await waitFor(() => {
      expect(screen.getByText('Fallback op-fallback')).toBeInTheDocument();
    });
  });

  it('returns no rows when the query has no data yet', () => {
    currentApiResponse = undefined as any;

    renderWithProviders({ edit: true });

    expect(
      screen.queryByRole('button', { name: 'commons.deleteSelection' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('preserves the default operator when clearing the selection', async () => {
    setUserInfo({
      mappedExternalUserId: 'default-op'
    } as UserInfoDTO);

    renderWithProviders({ edit: true, showFormState: true });

    await waitFor(() => {
      expect(
        screen.getByText(getOperatorDisplayName(pageOneResponse.content[2]))
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'commons.deleteSelection' })
    );

    await waitFor(() => {
      expect(getFormState().enabledOperators).toEqual(['default-op']);
      expect(getFormState().disabledOperators).toEqual(['op-1']);
    });
  });

  describe('API filter logic', () => {
    it('passes debtPositionTypeOrgId to useSearch filters when in edit mode', () => {
      renderWithProviders({ edit: true });

      expect(mockedUseSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { debtPositionTypeOrgId: 123 }
        })
      );
    });

    it('does not pass debtPositionTypeOrgId when not in edit mode (create mode)', () => {
      // Override beforeEach setup for create mode, which has no URL params
      mockedUseParams.mockReturnValue({});

      renderWithProviders({ edit: false });

      expect(mockedUseSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { debtPositionTypeOrgId: undefined }
        })
      );
    });

    it('does not send a NaN debtPositionTypeOrgId when the route param is not yet resolved (browser reload race)', () => {
      // Simulates a hard browser reload: edit mode mounts before useParams
      // resolves the debtPositionTypeOrgId segment from the URL.
      mockedUseParams.mockReturnValue({});

      renderWithProviders({ edit: true });

      expect(mockedUseSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { debtPositionTypeOrgId: undefined }
        })
      );
    });
  });
});
