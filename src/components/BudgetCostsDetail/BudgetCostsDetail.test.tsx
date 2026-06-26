import { render, screen } from '../../__tests__/renderers';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { BudgetCostsDetail } from './BudgetCostsDetail';
import {
  DebtPositionTypeOrgBalanceCostDTO,
  DebtPositionTypeOrgBalanceCostType
} from '../../../generated/apiClient';

const currentYear = String(new Date().getFullYear());
const previousYear = String(new Date().getFullYear() - 1);
const nextYear = String(new Date().getFullYear() + 1);

const typeKey = (t: string) =>
  `debtTypeOrgCreate.accounting.budgetCost.type.${t}`;

const costs: Array<DebtPositionTypeOrgBalanceCostDTO> = [
  {
    type: DebtPositionTypeOrgBalanceCostType.NOTIFICATION_COST,
    operatingYear: currentYear,
    sectionCode: 'CAP-NOW',
    sectionDescription: 'Capitolo corrente',
    officeCode: 'UFF-NOW',
    officeDescription: 'Ufficio corrente',
    assessmentCode: 'ACC-NOW',
    assessmentDescription: 'Accertamento corrente'
  },
  {
    // partial: only sectionCode set
    type: DebtPositionTypeOrgBalanceCostType.INTEREST_COST,
    operatingYear: currentYear,
    sectionCode: 'CAP-INT'
  }
];

describe('BudgetCostsDetail', () => {
  it('always renders previous, current and next year tabs, current selected', () => {
    render(<BudgetCostsDetail costs={costs} />);

    expect(screen.getByRole('tab', { name: previousYear })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: currentYear })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: nextYear })).toBeInTheDocument();

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      currentYear
    );
    expect(screen.getByText('CAP-NOW')).toBeInTheDocument();
  });

  it('always renders all three cost groups, even when a group has no data', () => {
    render(<BudgetCostsDetail costs={costs} />);

    expect(screen.getByText(typeKey('NOTIFICATION_COST'))).toBeInTheDocument();
    expect(screen.getByText(typeKey('DELAY_COST'))).toBeInTheDocument(); // no data
    expect(screen.getByText(typeKey('INTEREST_COST'))).toBeInTheDocument();
  });

  it('substitutes a "-" placeholder for missing values', () => {
    render(<BudgetCostsDetail costs={costs} />);

    // INTEREST_COST only has sectionCode -> 5 missing fields; DELAY_COST -> 6
    expect(screen.getByText('CAP-INT')).toBeInTheDocument();
    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(11);
  });

  it('keeps the three groups (all placeholders) for a year without data', async () => {
    render(<BudgetCostsDetail costs={costs} />);

    await userEvent.click(screen.getByRole('tab', { name: previousYear }));

    expect(screen.queryByText('CAP-NOW')).not.toBeInTheDocument();
    expect(screen.getByText(typeKey('NOTIFICATION_COST'))).toBeInTheDocument();
    expect(screen.getByText(typeKey('DELAY_COST'))).toBeInTheDocument();
    expect(screen.getByText(typeKey('INTEREST_COST'))).toBeInTheDocument();
    // 3 groups x 6 rows, all empty
    expect(screen.getAllByText('-').length).toBe(18);
  });

  it('still renders the 3 tabs and 3 groups when there are no costs at all', () => {
    render(<BudgetCostsDetail costs={[]} />);

    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByText(typeKey('NOTIFICATION_COST'))).toBeInTheDocument();
    expect(screen.getAllByText('-')).toHaveLength(18);
  });
});
