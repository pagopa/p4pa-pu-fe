import { vi } from 'vitest';
import { render, screen } from '../../../../../__tests__/renderers';

import { BudgetItems } from './BudgetItems';
import { DebtPositionTypeOrgBalanceCostType } from '@generated/core/data-contracts';

const mockFields = [
  {
    id: '1',
    type: DebtPositionTypeOrgBalanceCostType.NOTIFICATION_COST,
    operatingYear: '2026',
    readOnly: false
  },
  {
    id: '2',
    type: DebtPositionTypeOrgBalanceCostType.DELAY_COST,
    operatingYear: '2026',
    readOnly: false
  },
  {
    id: '3',
    type: DebtPositionTypeOrgBalanceCostType.INTEREST_COST,
    operatingYear: '2026',
    readOnly: false
  }
];

const mockBalanceCosts = [
  { enabled: false },
  { enabled: true },
  { enabled: false }
];

vi.mock('react-hook-form', () => ({
  useFormContext: () => ({
    control: {}
  }),
  useFieldArray: () => ({
    fields: mockFields
  }),
  useWatch: () => mockBalanceCosts
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('@core/components/Wizard/SectionBox', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )
}));

vi.mock('@core/components/FormComponent', () => ({
  FormComponent: {
    ControlledSwitch: ({
      name,
      disabled,
      label
    }: {
      name: string;
      disabled?: boolean;
      label: string;
    }) => (
      <div data-testid={name} data-disabled={String(!!disabled)}>
        {label}
      </div>
    )
  }
}));

vi.mock('./CostConfiguration', () => ({
  CostConfiguration: ({
    index,
    disabled
  }: {
    index: number;
    disabled?: boolean;
  }) => (
    <div
      data-testid={`cost-configuration-${index}`}
      data-disabled={String(!!disabled)}
    />
  )
}));

describe('BudgetItems', () => {
  it('renders all budget costs', () => {
    render(<BudgetItems />);

    mockFields.forEach((_, index) => {
      expect(
        screen.getByTestId(
          `debtPositionTypeOrgBalanceCostRequestList.${index}.enabled`
        )
      ).toBeInTheDocument();
    });
  });

  it('shows CostConfiguration only for enabled costs', () => {
    render(<BudgetItems />);

    expect(
      screen.queryByTestId('cost-configuration-0')
    ).not.toBeInTheDocument();

    expect(screen.getByTestId('cost-configuration-1')).toBeInTheDocument();

    expect(
      screen.queryByTestId('cost-configuration-2')
    ).not.toBeInTheDocument();
  });
});
