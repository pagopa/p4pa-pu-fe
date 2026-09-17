/* eslint-disable react/prop-types */
import { render, screen } from '../../../../../__tests__/renderers';
import { FormProvider, useForm } from 'react-hook-form';
import { vi } from 'vitest';

import { CostConfiguration } from './CostConfiguration';
import { DebtTypeOrgForm } from '@core/routes/DebtTypeOrgCreate/types';

vi.mock('@core/components/FormComponent', () => ({
  FormComponent: {
    ControlledTextField: ({
      name,
      label,
      disabled,
      required
    }: {
      name: string;
      label: string;
      disabled?: boolean;
      required?: boolean;
    }) => (
      <div
        data-testid={`field-${name}`}
        data-disabled={String(!!disabled)}
        data-required={String(!!required)}
      >
        {label}
      </div>
    )
  }
}));

const renderWithForm = (props?: { index?: number; disabled?: boolean }) => {
  const Wrapper = () => {
    const methods = useForm<DebtTypeOrgForm>();

    return (
      <FormProvider {...methods}>
        <CostConfiguration
          index={props?.index ?? 0}
          disabled={props?.disabled}
        />
      </FormProvider>
    );
  };

  return render(<Wrapper />);
};

describe('CostConfiguration', () => {
  it('renders all cost configuration fields', () => {
    renderWithForm();

    expect(
      screen.getByTestId(
        'field-debtPositionTypeOrgBalanceCostRequestList.0.sectionCode'
      )
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(
        'field-debtPositionTypeOrgBalanceCostRequestList.0.sectionDescription'
      )
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(
        'field-debtPositionTypeOrgBalanceCostRequestList.0.officeCode'
      )
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(
        'field-debtPositionTypeOrgBalanceCostRequestList.0.officeDescription'
      )
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(
        'field-debtPositionTypeOrgBalanceCostRequestList.0.assessmentCode'
      )
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(
        'field-debtPositionTypeOrgBalanceCostRequestList.0.assessmentDescription'
      )
    ).toBeInTheDocument();
  });

  it('uses the provided index in field names', () => {
    renderWithForm({ index: 2 });

    expect(
      screen.getByTestId(
        'field-debtPositionTypeOrgBalanceCostRequestList.2.sectionCode'
      )
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(
        'field-debtPositionTypeOrgBalanceCostRequestList.2.sectionDescription'
      )
    ).toBeInTheDocument();
  });

  it('passes disabled to all fields', () => {
    renderWithForm({ disabled: true });

    expect(
      screen.getByTestId(
        'field-debtPositionTypeOrgBalanceCostRequestList.0.sectionCode'
      )
    ).toHaveAttribute('data-disabled', 'true');

    expect(
      screen.getByTestId(
        'field-debtPositionTypeOrgBalanceCostRequestList.0.sectionDescription'
      )
    ).toHaveAttribute('data-disabled', 'true');

    expect(
      screen.getByTestId(
        'field-debtPositionTypeOrgBalanceCostRequestList.0.officeCode'
      )
    ).toHaveAttribute('data-disabled', 'true');

    expect(
      screen.getByTestId(
        'field-debtPositionTypeOrgBalanceCostRequestList.0.officeDescription'
      )
    ).toHaveAttribute('data-disabled', 'true');

    expect(
      screen.getByTestId(
        'field-debtPositionTypeOrgBalanceCostRequestList.0.assessmentCode'
      )
    ).toHaveAttribute('data-disabled', 'true');

    expect(
      screen.getByTestId(
        'field-debtPositionTypeOrgBalanceCostRequestList.0.assessmentDescription'
      )
    ).toHaveAttribute('data-disabled', 'true');
  });

  it('does not disable fields when disabled is not provided', () => {
    renderWithForm();

    expect(
      screen.getByTestId(
        'field-debtPositionTypeOrgBalanceCostRequestList.0.sectionCode'
      )
    ).toHaveAttribute('data-disabled', 'false');
  });
});
