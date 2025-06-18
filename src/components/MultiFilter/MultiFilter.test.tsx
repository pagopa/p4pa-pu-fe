import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '../../__tests__/renderers';
import MultiFilter from './MultiFilter';
import { FilterMap } from '../../hooks/useMultiFilters';
import { COMPONENT_TYPE, FilterItem } from '../FilterContainer/FilterContainer';
import { selectedFilters, setSelectedFilters } from '../../store/FilterStore';

vi.mock('../FilterContainer/FilterContainer', () => ({
  default: vi.fn(({ items }) => (
    <div data-testid="filter-container">
      {items.map((item: FilterItem) => (
        <div key={item.label}>{item.label}</div>
      ))}
    </div>
  )),
  COMPONENT_TYPE: {
    textField: 'textField',
    select: 'select',
    button: 'button',
    dateRange: 'dateRange',
    amount: 'amount'
  }
}));

const mockFilterMap: FilterMap = {
  AMOUNT: {
    label: 'AMOUNT',
    fields: [{ type: COMPONENT_TYPE.textField, label: 'AMOUNT Field' }]
  },
  BILL_CODE: {
    label: 'BILL_CODE',
    fields: [{ type: COMPONENT_TYPE.textField, label: 'BILL_CODE Field' }]
  },
  IUV: {
    label: 'IUV',
    fields: [{ type: COMPONENT_TYPE.textField, label: 'IUV Field' }]
  },
  IUR: {
    label: 'IUR',
    fields: [{ type: COMPONENT_TYPE.textField, label: 'IUR Field' }]
  },
  IUD: {
    label: 'IUD',
    fields: [{ type: COMPONENT_TYPE.textField, label: 'IUD Field' }]
  },
  IUF: {
    label: 'IUF',
    fields: [{ type: COMPONENT_TYPE.textField, label: 'IUF Field' }]
  },
  DOCUMENT_CODE: {
    label: 'DOCUMENT_CODE',
    fields: [{ type: COMPONENT_TYPE.textField, label: 'DOCUMENT_CODE Field' }]
  },
  PAYER: {
    label: 'PAYER',
    fields: [{ type: COMPONENT_TYPE.textField, label: 'PAYER Field' }]
  },
  REPORT_ID: {
    label: 'REPORT_ID',
    fields: [{ type: COMPONENT_TYPE.textField, label: 'REPORT_ID Field' }]
  },
  TEMPORARY_CODE: {
    label: 'TEMPORARY_CODE',
    fields: [{ type: COMPONENT_TYPE.textField, label: 'TEMPORARY_CODE Field' }]
  },
  ACCOUNTING_DATE: {
    label: 'ACCOUNTING_DATE',
    fields: [{ type: COMPONENT_TYPE.dateRange, label: 'ACCOUNTING_DATE Field' }]
  },
  VALUE_DATE: {
    label: 'VALUE_DATE',
    fields: [{ type: COMPONENT_TYPE.dateRange, label: 'VALUE_DATE Field' }]
  },
  CLASSIFICATION_TYPE: {
    label: 'CLASSIFICATION_TYPE',
    fields: [
      { type: COMPONENT_TYPE.select, label: 'CLASSIFICATION_TYPE Field' }
    ]
  },
  LAST_CLASSIFICATION_DATE: {
    label: 'LAST_CLASSIFICATION_DATE',
    fields: [
      {
        type: COMPONENT_TYPE.dateRange,
        label: 'LAST_CLASSIFICATION_DATE Field'
      }
    ]
  },
  REGULATION_DATE: {
    label: 'REGULATION_DATE',
    fields: [{ type: COMPONENT_TYPE.dateRange, label: 'REGULATION_DATE Field' }]
  }
};

describe('MultiFilter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setSelectedFilters(['AMOUNT']);
  });

  it('invokes removeFilterRow with correct ID on remove button click', () => {
    // Start with both filters
    setSelectedFilters(['AMOUNT', 'BILL_CODE']);

    render(<MultiFilter filterMap={mockFilterMap} />);

    // Verify initial render has both filters
    const removeButtons = screen.getAllByRole('button', { name: 'remove' });
    expect(removeButtons).toHaveLength(2);

    // Remove firs filter row
    fireEvent.click(removeButtons[0]);

    expect(selectedFilters.value).toEqual(['BILL_CODE']);
  });
});
