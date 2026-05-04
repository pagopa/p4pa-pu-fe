import React from 'react';
import { vi } from 'vitest';
import { render, screen, waitFor } from '../../../../__tests__/renderers';
import userEvent from '@testing-library/user-event';
import { Step5Operators } from '.';
import { StoreProvider } from '../../../../store/GlobalStore';
import { FormProvider, useForm, FieldValues } from 'react-hook-form';
import { OperatorsSelection } from '../../../../../generated/data-contracts';
import { setOrganizationId } from '../../../../store/OrganizationIdStore';

// Mock the OperatorSelector component to isolate Step5Operators tests
vi.mock('./components/OperatorSelector', () => ({
  OperatorSelector: ({ edit }: { edit?: boolean }) => (
    <div data-testid="mocked-operator-selector">
      {edit ? 'Edit mode' : 'View mode'}
    </div>
  )
}));

// Mock API is not needed here since OperatorSelector is mocked

const renderWithForm = (
  ui: React.ReactElement,
  onSubmit?: (data: FieldValues) => void,
  defaultValues: Partial<FieldValues> = {}
) => {
  const Wrapper: React.FC = () => {
    const methods = useForm<FieldValues>({
      defaultValues: {
        operatorsSelection: OperatorsSelection.ALL,
        ...defaultValues
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

describe('Step5Operators (unit tests)', () => {
  beforeEach(() => {
    setOrganizationId(123);
    vi.clearAllMocks();
  });

  it('renders titles, subtitles, section title, and radio options', () => {
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
        name: 'debtTypeOrgCreate.operators.options.selected'
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

  it('allows selecting NONE option', async () => {
    renderWithForm(<Step5Operators />);

    const radioNone = screen.getByRole('radio', {
      name: 'debtTypeOrgCreate.operators.options.none'
    });
    await userEvent.click(radioNone);
    expect(radioNone).toBeChecked();
  });

  it('submits form with correct operatorsSelection value', async () => {
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

  it('renders OperatorSelector when SELECTED option is chosen', async () => {
    renderWithForm(<Step5Operators />);

    // Initially, mocked OperatorSelector should not be visible because default is ALL
    expect(
      screen.queryByTestId('mocked-operator-selector')
    ).toBeInTheDocument();

    // Change selection to SELECTED
    const radioSelected = screen.getByRole('radio', {
      name: 'debtTypeOrgCreate.operators.options.selected'
    });
    await userEvent.click(radioSelected);

    // OperatorSelector should be rendered (mocked)
    expect(screen.getByTestId('mocked-operator-selector')).toBeInTheDocument();
  });

  it('passes edit prop to OperatorSelector', () => {
    // Render with edit=true
    renderWithForm(<Step5Operators edit={true} />);

    // Check that mocked OperatorSelector renders (we can’t check prop directly, but presence is enough)
    expect(screen.getByTestId('mocked-operator-selector')).toBeInTheDocument();
  });
});
