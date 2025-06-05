import React from 'react';
import { OperatorSelector } from './OperatorSelector';
import * as api from '../../../../../api/debtPositionTypeOrgOperators';
import { useForm, FormProvider } from 'react-hook-form';
import {
  OperatorsSelection,
  UserInfo
} from '../../../../../../generated/data-contracts';
import {
  fireEvent,
  render,
  waitFor,
  screen
} from '../../../../../__tests__/renderers';
import { setUserInfo } from '../../../../../store/UserInfoStore';

// Realistic test data for API
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

// Mock only the API call
// @ts-expect-error mocking query
vi.spyOn(api, 'getDebtPositionTypeOrgOperators').mockImplementation(() => ({
  data: testApiResponse
}));

// Helper to render with form and store providers
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

describe('OperatorSelector integration tests', () => {
  test('renders operators and selection alert', async () => {
    renderWithProviders(true);

    // Wait for operators to appear
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Alert shows selected count
    expect(screen.getByText(/commons.selectedOperator/)).toBeInTheDocument();

    // Delete Selection button present
    expect(
      screen.getByRole('button', { name: 'commons.deleteSelection' })
    ).toBeInTheDocument();
  });

  test('default operator row is disabled for selection', async () => {
    setUserInfo({
      mappedExternalUserId: 'default-op'
    } as UserInfo);

    renderWithProviders(true);

    await waitFor(() => {
      expect(screen.getByText('Default Operator')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    const defaultOpCheckbox = checkboxes[checkboxes.length - 1];

    expect(defaultOpCheckbox).toBeDisabled();
  });

  test('clicking Delete Selection clears selection', async () => {
    renderWithProviders(true);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'commons.deleteSelection' })
      ).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'commons.deleteSelection' })
    );

    // Alert disappears since selection cleared
    await waitFor(() => {
      expect(
        screen.queryByText(/commons.selectedOperator/)
      ).not.toBeInTheDocument();
    });
  });

  test('selecting an operator updates selection', async () => {
    renderWithProviders(true);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    // Assuming first checkbox is "select all", second is John Doe, third is Jane Smith
    const janeCheckbox = checkboxes[2];

    // Select Jane Smith
    fireEvent.click(janeCheckbox);

    // Alert updates to show 2 selected operators
    await waitFor(() => {
      expect(screen.getByText(/commons.selectedOperator/)).toBeInTheDocument();
    });
  });
});
