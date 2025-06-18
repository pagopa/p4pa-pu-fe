import { describe, it, expect } from 'vitest';
import SearchCard from './SearchCard';
import { vi } from 'vitest';
import { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';
import { fireEvent, render, screen } from '../../__tests__/renderers';

describe('SearchCard', () => {
  const defaultProps = {
    title: 'Search Title',
    description: 'Search Description',
    fields: [
      {
        type: COMPONENT_TYPE.textField,
        label: 'Search Field',
        placeholder: 'Type something...'
      }
    ],
    button: [
      {
        text: 'Filter',
        variant: 'contained' as const,
        onClick: vi.fn()
      }
    ],
    multiFilterConfig: {
      AMOUNT: {
        label: 'Amount',
        fields: [
          {
            type: COMPONENT_TYPE.textField,
            label: 'Amount Field'
          }
        ]
      },
      BILL_CODE: {
        label: 'Bill Code',
        fields: [
          {
            type: COMPONENT_TYPE.textField,
            label: 'Bill Code Field'
          }
        ]
      },
      DOCUMENT_CODE: {
        label: 'Document Code',
        fields: [
          {
            type: COMPONENT_TYPE.textField,
            label: 'Document Code Field'
          }
        ]
      },
      IUV: {
        label: 'IUV',
        fields: [
          {
            type: COMPONENT_TYPE.textField,
            label: 'IUV Field'
          }
        ]
      },
      IUD: {
        label: 'IUD',
        fields: [
          {
            type: COMPONENT_TYPE.textField,
            label: 'IUD Field'
          }
        ]
      },
      IUR: {
        label: 'IUR',
        fields: [
          {
            type: COMPONENT_TYPE.textField,
            label: 'IUR Field'
          }
        ]
      },
      IUF: {
        label: 'IUF',
        fields: [
          {
            type: COMPONENT_TYPE.textField,
            label: 'IUF Field'
          }
        ]
      },
      PAYER: {
        label: 'PAYER',
        fields: [
          {
            type: COMPONENT_TYPE.textField,
            label: 'PAYER Field'
          }
        ]
      },
      REPORT_ID: {
        label: 'REPORT_ID',
        fields: [
          {
            type: COMPONENT_TYPE.textField,
            label: 'REPORT_ID Field'
          }
        ]
      },
      TEMPORARY_CODE: {
        label: 'TEMPORARY_CODE',
        fields: [
          {
            type: COMPONENT_TYPE.textField,
            label: 'TEMPORARY_CODE Field'
          }
        ]
      },
      ACCOUNTING_DATE: {
        label: 'ACCOUNTING_DATE',
        fields: [
          {
            type: COMPONENT_TYPE.textField,
            label: 'ACCOUNTING_DATE Field'
          }
        ]
      },
      VALUE_DATE: {
        label: 'VALUE_DATE',
        fields: [
          {
            type: COMPONENT_TYPE.textField,
            label: 'VALUE_DATE Field'
          }
        ]
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
        fields: [
          { type: COMPONENT_TYPE.dateRange, label: 'REGULATION_DATE Field' }
        ]
      }
    }
  };

  it('renders title and description', () => {
    render(<SearchCard {...defaultProps} />);

    expect(screen.getByText('Search Title')).toBeInTheDocument();
    expect(screen.getByText('Search Description')).toBeInTheDocument();
  });

  it('renders input field correctly', () => {
    render(<SearchCard {...defaultProps} />);

    const input = screen.getByPlaceholderText('Type something...');
    expect(input).toBeInTheDocument();
  });

  it('renders select field with options', () => {
    render(<SearchCard {...defaultProps} />);

    const select = screen.getByLabelText('Search Field');
    expect(select).toBeInTheDocument();
  });

  it('renders button and handles click', () => {
    render(<SearchCard {...defaultProps} />);

    const button = screen.getByRole('button', { name: '' });
    expect(button).toHaveAttribute('text', 'Filter');

    fireEvent.click(button);
    expect(defaultProps.button[0].onClick).toHaveBeenCalled();
  });

  it('renders MultiFilter when enabled', () => {
    render(<SearchCard {...defaultProps} />);

    expect(screen.getByLabelText('Search Field')).toBeInTheDocument();
  });

  it('does not render MultiFilter when disabled', () => {
    const propsWithoutFilter = {
      ...defaultProps,
      multiFilterConfig: undefined
    };

    render(<SearchCard {...propsWithoutFilter} />);

    const filterSelect = screen.queryByRole('combobox', { name: /Filter By/i });
    const filterInput = screen.queryByRole('textbox', {
      name: /Filter Input/i
    });

    expect(filterSelect).toBeNull();
    expect(filterInput).toBeNull();
  });

  it('renders with minimal props', () => {
    const minimalProps = {
      title: 'Minimal Title',
      description: 'Minimal Description'
    };

    render(<SearchCard {...minimalProps} />);

    expect(screen.getByText('Minimal Title')).toBeInTheDocument();
    expect(screen.getByText('Minimal Description')).toBeInTheDocument();
  });

  it('renders filters from useTelematicReceiptsFilters when filterContext is "TELEMATIC"', () => {
    render(
      <SearchCard
        title="Telematic"
        description="Desc"
        filterContext="TELEMATIC"
      />
    );

    expect(screen.getByLabelText('commons.searchIUV')).toBeInTheDocument();
    expect(
      screen.queryByText('commons.searchRegulationUniqueIdentifier')
    ).not.toBeInTheDocument();
  });

  it('renders filters from useReportingFilters when filterContext is "REPORTING"', () => {
    render(
      <SearchCard
        title="Reporting"
        description="Desc"
        filterContext="REPORTING"
      />
    );

    expect(
      screen.getByLabelText('commons.searchRegulationUniqueIdentifier')
    ).toBeInTheDocument();
    expect(screen.queryByText('commons.searchIUV')).not.toBeInTheDocument();
  });
});
