import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '../../__tests__/renderers';
import { Filter } from './Filter';
import { FilterItem, COMPONENT_TYPE } from '../FilterContainer/FilterContainer';
import { FilterMap } from '../../hooks/useMultiFilters';
import { KeyofFilterMap } from '../../store/FilterStore';

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
  },
  PAYMENT_DATE: {
    label: 'PAYMENT_DATE',
    fields: [{ type: COMPONENT_TYPE.dateRange, label: 'PAYMENT_DATE Field' }]
  },
  BILL_DATE: {
    label: 'BILL_DATE',
    fields: [{ type: COMPONENT_TYPE.dateRange, label: 'BILL_DATE Field' }]
  },
  REGION_VALUE_DATE: {
    label: 'REGION_VALUE_DATE',
    fields: [
      { type: COMPONENT_TYPE.dateRange, label: 'REGION_VALUE_DATE Field' }
    ]
  },
  PAY_DATE: {
    label: 'PAY_DATE',
    fields: [{ type: COMPONENT_TYPE.dateRange, label: 'PAY_DATE Field' }]
  },
  ACCOUNT_REGISTRY_CODE: {
    label: 'ACCOUNT_REGISTRY_CODE',
    fields: [
      { type: COMPONENT_TYPE.textField, label: 'ACCOUNT_REGISTRY_CODE Field' }
    ]
  },
  PSP_COMPANY_NAME: {
    label: 'PSP_COMPANY_NAME',
    fields: [
      { type: COMPONENT_TYPE.textField, label: 'PSP_COMPANY_NAME Field' }
    ]
  },
  REGULATION_UNIQUE_IDENTIFIER: {
    label: 'REGULATION_UNIQUE_IDENTIFIER',
    fields: [
      {
        type: COMPONENT_TYPE.textField,
        label: 'REGULATION_UNIQUE_IDENTIFIER Field'
      }
    ]
  },
  REMITTANCE_INFORMATION: {
    label: 'REMITTANCE_INFORMATION',
    fields: [
      { type: COMPONENT_TYPE.textField, label: 'REMITTANCE_INFORMATION Field' }
    ]
  },
  // Assessment filters - required by FilterMap type
  ASSESSMENT_NAME: {
    label: 'ASSESSMENT_NAME',
    fields: [{ type: COMPONENT_TYPE.textField, label: 'ASSESSMENT_NAME Field' }]
  },
  DEBT_TYPE: {
    label: 'DEBT_TYPE',
    fields: [{ type: COMPONENT_TYPE.select, label: 'DEBT_TYPE Field' }]
  },
  ASSESSMENT_STATUS: {
    label: 'ASSESSMENT_STATUS',
    fields: [{ type: COMPONENT_TYPE.select, label: 'ASSESSMENT_STATUS Field' }]
  },
  LAST_UPDATE_DATE: {
    label: 'LAST_UPDATE_DATE',
    fields: [
      { type: COMPONENT_TYPE.dateRange, label: 'LAST_UPDATE_DATE Field' }
    ]
  }
};

describe('Filter Component', () => {
  const onChange = vi.fn();
  const value = 'AMOUNT';
  const selectedFilters: Array<KeyofFilterMap> = ['AMOUNT'];

  it('renders select with options from filterMap', () => {
    render(
      <Filter
        filterMap={mockFilterMap}
        onChange={onChange}
        value={value}
        selectedFilters={selectedFilters}
      />
    );

    // Open the Select dropdown
    const selectElement = screen.getByRole('combobox');
    fireEvent.mouseDown(selectElement);

    // Verify that the options are rendered correctly
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(Object.keys(mockFilterMap).length);
    expect(options[0]).toHaveTextContent('AMOUNT');
    expect(options[1]).toHaveTextContent('BILL_CODE');

    // Verify that the selectedFilters disable the correct option
    expect(options[0]).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders fields from the selected filter', () => {
    render(
      <Filter
        filterMap={mockFilterMap}
        onChange={onChange}
        value={value}
        selectedFilters={selectedFilters}
      />
    );

    // Verify that the FilterContainer is rendered with the correct fields
    const filterContainer = screen.getByTestId('filter-container');
    expect(filterContainer).toBeInTheDocument();

    // Verify that the fields for the selected value are rendered
    const searchField = screen.getByText('AMOUNT Field');
    expect(searchField).toBeInTheDocument();
  });
});
