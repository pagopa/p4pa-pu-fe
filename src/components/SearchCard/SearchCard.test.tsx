import { describe, it, expect } from 'vitest';
import SearchCard from './SearchCard';
import { vi } from 'vitest';
import { COMPONENT_TYPE } from '../FilterContainer/FilterContainer';
import { fireEvent, render, screen } from '../../__tests__/renderers';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';

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
      },
      PAYMENT_DATE: {
        label: 'PAYMENT_DATE',
        fields: [
          { type: COMPONENT_TYPE.dateRange, label: 'PAYMENT_DATE Field' }
        ]
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
          {
            type: COMPONENT_TYPE.textField,
            label: 'ACCOUNT_REGISTRY_CODE Field'
          }
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
          {
            type: COMPONENT_TYPE.textField,
            label: 'REMITTANCE_INFORMATION Field'
          }
        ]
      },
      ASSESSMENT_NAME: {
        label: 'ASSESSMENT_NAME',
        fields: [
          {
            type: COMPONENT_TYPE.textField,
            label: 'ASSESSMENT_NAME Field'
          }
        ]
      },
      DEBT_TYPE: {
        label: 'DEBT_TYPE',
        fields: [
          {
            type: COMPONENT_TYPE.select,
            label: 'DEBT_TYPE Field'
          }
        ]
      },
      ASSESSMENT_STATUS: {
        label: 'ASSESSMENT_STATUS',
        fields: [
          {
            type: COMPONENT_TYPE.select,
            label: 'ASSESSMENT_STATUS Field'
          }
        ]
      },
      LAST_UPDATE_DATE: {
        label: 'LAST_UPDATE_DATE',
        fields: [
          {
            type: COMPONENT_TYPE.dateRange,
            label: 'LAST_UPDATE_DATE Field'
          }
        ]
      },
      ASSESSMENT_CODE: {
        label: 'ASSESSMENT_CODE',
        fields: [
          { type: COMPONENT_TYPE.textField, label: 'ASSESSMENT_CODE Field' }
        ]
      },
      ASSESSMENT_DESCRIPTION: {
        label: 'ASSESSMENT_DESCRIPTION',
        fields: [
          {
            type: COMPONENT_TYPE.textField,
            label: 'ASSESSMENT_DESCRIPTION Field'
          }
        ]
      },
      OFFICE_CODE: {
        label: 'OFFICE_CODE',
        fields: [{ type: COMPONENT_TYPE.textField, label: 'OFFICE_CODE Field' }]
      },
      OFFICE_DESCRIPTION: {
        label: 'OFFICE_DESCRIPTION',
        fields: [
          { type: COMPONENT_TYPE.textField, label: 'OFFICE_DESCRIPTION Field' }
        ]
      },
      SECTION_CODE: {
        label: 'SECTION_CODE',
        fields: [
          { type: COMPONENT_TYPE.textField, label: 'SECTION_CODE Field' }
        ]
      },
      SECTION_DESCRIPTION: {
        label: 'SECTION_DESCRIPTION',
        fields: [
          { type: COMPONENT_TYPE.textField, label: 'SECTION_DESCRIPTION Field' }
        ]
      },
      OPERATING_YEAR: {
        label: 'OPERATING_YEAR',
        fields: [
          { type: COMPONENT_TYPE.textField, label: 'OPERATING_YEAR Field' }
        ]
      },
      DEBT_POSITION_TYPE_ORG_CODE: {
        label: 'DEBT_POSITION_TYPE_ORG_CODE',
        fields: [
          {
            type: COMPONENT_TYPE.textField,
            label: 'DEBT_POSITION_TYPE_ORG_CODE Field'
          }
        ]
      },
      STATUS: {
        label: 'STATUS',
        fields: [{ type: COMPONENT_TYPE.select, label: 'STATUS Field' }]
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

  it('renders ErrorMessage correctly when passed through render prop', () => {
    const propsWithError = {
      ...defaultProps,
      render: <ErrorMessage testId="multifilters-error-text" />
    };

    render(<SearchCard {...propsWithError} />);

    const errorAlert = screen.getByTestId('multifilters-error-text');
    expect(errorAlert).toBeInTheDocument();

    expect(errorAlert).toHaveAttribute('role', 'alert');
    expect(
      errorAlert.closest('[class*="MuiAlert-standardError"]')
    ).toBeInTheDocument();

    expect(errorAlert).toHaveTextContent('commons.filters.atLeastOneFilter');
  });

  it('does not render ErrorMessage when render prop is not provided', () => {
    render(<SearchCard {...defaultProps} />);

    const errorAlert = screen.queryByTestId('multifilters-error-text');
    expect(errorAlert).not.toBeInTheDocument();
  });

  it('renders ErrorMessage conditionally when passed through render prop', () => {
    const showError = true;
    const propsWithConditionalError = {
      ...defaultProps,
      render: showError && <ErrorMessage testId="multifilters-error-text" />
    };

    render(<SearchCard {...propsWithConditionalError} />);

    const errorAlert = screen.getByTestId('multifilters-error-text');
    expect(errorAlert).toBeInTheDocument();
  });

  it('does not render ErrorMessage when conditional render prop is false', () => {
    const showError = false;
    const propsWithConditionalError = {
      ...defaultProps,
      render: showError && ErrorMessage
    };

    render(<SearchCard {...propsWithConditionalError} />);

    const errorAlert = screen.queryByTestId('multifilters-error-text');
    expect(errorAlert).not.toBeInTheDocument();
  });
});
