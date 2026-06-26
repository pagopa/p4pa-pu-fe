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

    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByText(previousYear)).toBeInTheDocument();
    expect(screen.getByText(currentYear)).toBeInTheDocument();
    expect(screen.getByText(nextYear)).toBeInTheDocument();

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      currentYear
    );
    expect(screen.getByText('CAP-NOW')).toBeInTheDocument();
  });

  it('gives each tab a descriptive accessible name for screen readers', () => {
    render(<BudgetCostsDetail costs={costs} />);

    // Visible label stays the bare year; aria-label carries the spoken text.
    // (test i18n echoes keys, so the interpolated key is the accessible name)
    const tab = screen.getByText(currentYear).closest('[role="tab"]');
    expect(tab).toHaveAttribute(
      'aria-label',
      'debtTypeOrgCreate.accounting.budgetCost.yearTabLabel'
    );
  });

  it('always renders all three cost groups, even when a group has no data', () => {
    render(<BudgetCostsDetail costs={costs} />);

    expect(screen.getByText(typeKey('NOTIFICATION_COST'))).toBeInTheDocument();
    expect(screen.getByText(typeKey('DELAY_COST'))).toBeInTheDocument(); // no data
    expect(screen.getByText(typeKey('INTEREST_COST'))).toBeInTheDocument();
  });

  it('substitutes a "-" placeholder for missing values', () => {
    render(<BudgetCostsDetail costs={costs} />);

    expect(screen.getByText('CAP-INT')).toBeInTheDocument();
    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(11);
  });

  it('moves focus to the tabpanel on year switch so the SR reads new content', async () => {
    render(<BudgetCostsDetail costs={costs} />);

    const panel = screen.getByRole('tabpanel');
    expect(panel).not.toHaveFocus();

    await userEvent.click(screen.getByText(previousYear));

    expect(screen.queryByText('CAP-NOW')).not.toBeInTheDocument();
    expect(screen.getByRole('tabpanel')).toHaveFocus();
    // groups still present, all placeholders for the empty year
    expect(screen.getByText(typeKey('DELAY_COST'))).toBeInTheDocument();
    expect(screen.getAllByText('-')).toHaveLength(18);
  });

  it('links the tabpanel to the active tab', () => {
    render(<BudgetCostsDetail costs={costs} />);

    const panel = screen.getByRole('tabpanel');
    const selectedTab = screen.getByRole('tab', { selected: true });
    expect(panel.getAttribute('aria-labelledby')).toBe(selectedTab.id);
  });

  it('still renders the 3 tabs and 3 groups when there are no costs at all', () => {
    render(<BudgetCostsDetail costs={[]} />);

    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByText(typeKey('NOTIFICATION_COST'))).toBeInTheDocument();
    expect(screen.getAllByText('-')).toHaveLength(18);
  });
});
