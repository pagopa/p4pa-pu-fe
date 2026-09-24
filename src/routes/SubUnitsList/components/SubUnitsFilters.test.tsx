import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { SubUnitsFilters } from './SubUnitsFilters';
import { OrgSubUnitStatus } from '@generated/core/data-contracts';
import { SubUnitType } from '@generated/core/client';

vi.mock('react-hook-form', () => ({
  useFormContext: () => ({ control: {} })
}));

vi.mock('@core/components/FormComponent', () => ({
  FormComponent: {
    ControlledTextField: ({ name, label }: { name: string; label: string }) => (
      <div data-testid={`text-field-${name}`}>{label}</div>
    ),
    ControlledSelect: ({
      name,
      options
    }: {
      name: string;
      options: Array<{ label: string; value: string }>;
    }) => (
      <div data-testid={`select-${name}`}>
        {options.map((option) => (
          <span
            key={option.value}
            data-testid={`option-${name}-${option.value}`}
          >
            {option.label}
          </span>
        ))}
      </div>
    ),
    Button: ({
      label,
      onClick,
      type,
      variant
    }: {
      label: string;
      onClick?: () => void;
      type?: 'button' | 'submit';
      variant?: string;
    }) => (
      <button
        type={type}
        data-testid={`filter-button-${variant ?? 'primary'}`}
        onClick={onClick}
      >
        {label}
      </button>
    )
  }
}));

describe('SubUnitsFilters', () => {
  it('renders a status option for every OrgSubUnitStatus value', () => {
    render(<SubUnitsFilters clearFilters={vi.fn()} />);

    Object.values(OrgSubUnitStatus).forEach((status) => {
      expect(screen.getByTestId(`option-status-${status}`)).toBeInTheDocument();
    });
  });

  it('renders a sub-unit-type option for every SubUnitType value, unlabeled/untranslated', () => {
    render(<SubUnitsFilters clearFilters={vi.fn()} />);

    Object.values(SubUnitType).forEach((type) => {
      const option = screen.getByTestId(`option-subUnitType-${type}`);
      expect(option).toHaveTextContent(type);
    });
  });

  it('calls clearFilters when the clear button is clicked', () => {
    const clearFilters = vi.fn();
    render(<SubUnitsFilters clearFilters={clearFilters} />);

    fireEvent.click(screen.getByTestId('filter-button-naked'));

    expect(clearFilters).toHaveBeenCalledTimes(1);
  });

  it('renders the apply button as a submit button', () => {
    render(<SubUnitsFilters clearFilters={vi.fn()} />);

    expect(screen.getByTestId('filter-button-primary')).toHaveAttribute(
      'type',
      'submit'
    );
  });
});
