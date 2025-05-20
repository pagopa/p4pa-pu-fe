import React from 'react';
import { vi } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor
} from '../../../../__tests__/renderers';
import userEvent from '@testing-library/user-event';
import { Step5Operators } from '.';
import { StoreProvider } from '../../../../store/GlobalStore';
import { FormProvider, useForm, FieldValues } from 'react-hook-form';
import { OperatorsSelection } from '../../../../../generated/data-contracts';
import { setOrganizationId } from '../../../../store/OrganizationIdStore';

const mockApiResponse = {
  content: [
    {
      operatorId: 'op1',
      mappedExternalUserId: 'ext1',
      firstName: 'John',
      lastName: 'Doe',
      enabled: true
    },
    {
      operatorId: 'op2',
      mappedExternalUserId: 'ext2',
      firstName: 'Jane',
      lastName: 'Smith',
      enabled: false
    }
  ],
  totalPages: 1,
  number: 0,
  size: 10
};

vi.mock('../../../../api/debtPositionTypeOrgOperators', () => ({
  getDebtPositionTypeOrgOperators: vi.fn(() => ({
    data: mockApiResponse,
    isLoading: false,
    error: null
  }))
}));

// Helper to render component with fresh form context per test
const renderWithForm = (
  ui: React.ReactElement,
  onSubmit?: (data: FieldValues) => void
) => {
  const Wrapper: React.FC = () => {
    const methods = useForm<FieldValues>({
      defaultValues: {
        operatorsSelection: OperatorsSelection.ALL
      }
    });

    return (
      <StoreProvider>
        <FormProvider {...methods}>
          {onSubmit ? (
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              {ui}
              <button type="submit">Submit</button>
            </form>
          ) : (
            ui
          )}
        </FormProvider>
      </StoreProvider>
    );
  };

  return render(<Wrapper />);
};

describe('Step5Operators', () => {
  beforeEach(() => {
    setOrganizationId(123);
    vi.clearAllMocks();
  });

  it('renders all main titles, section, and radio options', () => {
    renderWithForm(<Step5Operators />);

    expect(
      screen.getByText('debtTypeOrgCreate.operators.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.operators.subtitle')
    ).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeOrgCreate.operators.section.operatorEntities')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('radio', {
        name: 'debtTypeOrgCreate.operators.options.all'
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', {
        name: 'debtTypeOrgCreate.operators.options.none'
      })
    ).toBeInTheDocument();
  });

  it('defaults to ALL option selected', () => {
    renderWithForm(<Step5Operators />);

    const radioAll = screen.getByRole('radio', {
      name: 'debtTypeOrgCreate.operators.options.all'
    });
    const radioNone = screen.getByRole('radio', {
      name: 'debtTypeOrgCreate.operators.options.none'
    });

    expect(radioAll).toBeChecked();
    expect(radioNone).not.toBeChecked();
  });

  it('allows selecting NONE option', () => {
    renderWithForm(<Step5Operators />);

    const radioNone = screen.getByRole('radio', {
      name: 'debtTypeOrgCreate.operators.options.none'
    });
    fireEvent.click(radioNone);
    expect(radioNone).toBeChecked();
  });

  it('submits form with default (ALL) selection and calls onSubmit', async () => {
    const onSubmit = vi.fn();
    renderWithForm(<Step5Operators />, onSubmit);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { operatorsSelection: OperatorsSelection.ALL },
        expect.anything()
      );
    });
  });

  it('submits form with NONE selection and calls onSubmit', async () => {
    const onSubmit = vi.fn();
    renderWithForm(<Step5Operators />, onSubmit);

    const radioNone = screen.getByRole('radio', {
      name: 'debtTypeOrgCreate.operators.options.none'
    });
    fireEvent.click(radioNone);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { operatorsSelection: OperatorsSelection.NONE },
        expect.anything()
      );
    });
  });

  // Optional edge case test if no selection possible (usually radios always have one)
  it('submits form with no selection (edge case)', async () => {
    const onSubmit = vi.fn();
    // Render with no default to simulate no selection
    const Wrapper: React.FC = () => {
      const methods = useForm<FieldValues>({ defaultValues: {} });
      return (
        <StoreProvider>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Step5Operators />
              <button type="submit">Submit</button>
            </form>
          </FormProvider>
        </StoreProvider>
      );
    };

    render(<Wrapper />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('displays OperatorSelector when SELECTED option is chosen', async () => {
    renderWithForm(<Step5Operators />);

    const radioSelected = screen.getByRole('radio', {
      name: 'debtTypeOrgCreate.operators.options.selected'
    });
    fireEvent.click(radioSelected);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('submits form with selected operators when SELECTED option is chosen', async () => {
    const onSubmit = vi.fn();
    renderWithForm(<Step5Operators />, onSubmit);

    const radioSelected = screen.getByRole('radio', {
      name: 'debtTypeOrgCreate.operators.options.selected'
    });
    fireEvent.click(radioSelected);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);

    const nextButton = screen.getByRole('button', { name: 'commons.continue' });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        operatorsSelection: OperatorsSelection.SELECTED,
        enabledOperators: ['ext1']
      });
    });
  });
});
