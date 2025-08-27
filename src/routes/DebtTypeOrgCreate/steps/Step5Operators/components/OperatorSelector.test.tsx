/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor
} from '../../../../../__tests__/renderers';
import { useForm, FormProvider } from 'react-hook-form';
import {
  OperatorsSelection,
  UserInfo
} from '../../../../../../generated/data-contracts';
import * as api from '../../../../../api/debtPositionTypeOrgOperators';
import { OperatorSelector } from './OperatorSelector';
import { setUserInfo } from '../../../../../store/UserInfoStore';
import { vi } from 'vitest';

// Sample data to be returned by the mocked useSearch hook
const testApiResponse = {
  content: [
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
  ],
  totalPages: 1,
  totalElements: 3,
  size: 5,
  number: 0
};

const mockMutateAsync = vi.fn(() => Promise.resolve());

vi.mock('../../../../../hooks/useSearch', () => ({
  useSearch: vi.fn(() => ({
    query: {
      data: testApiResponse,
      isLoading: false,
      mutateAsync: mockMutateAsync
    },
    applyFilters: vi.fn()
  }))
}));

// Spy on the API mock; return data synchronously as returned by useSearch
vi.spyOn(api, 'getDebtPositionTypeOrgOperators').mockImplementation(
  () =>
    ({
      data: testApiResponse
    }) as any
);

// Helper: render the component wrapped with RHF form context and optional edit mode
const renderWithProviders = (edit?: boolean) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm({
      defaultValues: {
        enabledOperators: [],
        disabledOperators: [],
        operatorsSelection: OperatorsSelection.SELECTED
      }
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  return render(
    <Wrapper>
      <OperatorSelector edit={edit} />
    </Wrapper>
  );
};

describe('OperatorSelector component integration', () => {
  beforeEach(() => {
    // Reset the user info to empty before each test
    setUserInfo(undefined);
  });

  it('renders operators and displays selection alert', async () => {
    renderWithProviders(true /* edit mode */);

    // Wait for operators to be rendered by useSearch data
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Default Operator')).toBeInTheDocument();
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
    } as UserInfo);

    renderWithProviders(true);

    await waitFor(() => {
      expect(screen.getByText('Default Operator')).toBeInTheDocument();
    });

    // Get checkboxes (exclude "Select All"; assumes basic structure)
    const checkboxes = screen.getAllByRole('checkbox');

    // Find checkbox corresponding to default-op row: last checkbox should be default operator row
    const defaultOperatorCheckbox = checkboxes[checkboxes.length - 1];
    expect(defaultOperatorCheckbox).toBeDisabled();
  });

  it('clears selection when Delete Selection button is clicked', async () => {
    renderWithProviders(true);

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
    renderWithProviders(true);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    // Assuming first checkbox is Select All, second checkbox corresponds to John Doe, third to Jane Smith, etc.
    const janeCheckbox = checkboxes[2];

    // Select Jane Smith
    fireEvent.click(janeCheckbox);

    // Alert updates (now 2 selected)
    await waitFor(() => {
      expect(screen.getByText(/commons.selectedOperator/)).toBeInTheDocument();
    });
  });
});
