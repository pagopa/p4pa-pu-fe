import { describe, expect, it } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import { vi } from 'vitest';
import { Filter } from './Filter';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const mockFilterMap = {
  search: { label: 'Search', fields: [{ type: 0, label: 'Search Field' }] },
  name: { label: 'Name', fields: [{ type: 0, label: 'Name Field' }] }
};

describe('Filter Component', () => {
  it('renders select with options from filterMap', () => {
    render(<Filter filterMap={mockFilterMap} />);
    expect(screen.getByLabelText('commons.searchFor')).toBeInTheDocument();
  });

  it('renders fields from the selected filter', () => {
    render(<Filter filterMap={mockFilterMap} />);
    expect(screen.getByText('Search Field', { selector: 'label' })).toBeInTheDocument();
  });
});
