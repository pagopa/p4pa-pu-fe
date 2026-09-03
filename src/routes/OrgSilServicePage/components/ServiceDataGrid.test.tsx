/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import { ServiceDataGrid } from './ServiceDataGrid';
import {
  OrgSilServiceType,
  PagedOrgSilServiceView
} from '../../../../generated/core/client';

vi.mock('../../../components/DataGrid/CustomDataGrid', () => ({
  default: ({ rows, columns }: any) => (
    <div data-testid="custom-data-grid">
      {rows.map((row: any, index: number) => {
        const actionsColumn = columns.find(
          (col: any) => col.field === 'actions'
        );
        const actionCell = actionsColumn?.renderCell
          ? actionsColumn.renderCell({ row })
          : null;

        return (
          <div key={index} data-testid={`row-${row.orgSilServiceId}`}>
            <span>{row.applicationName}</span>
            <span>{row.serviceType}</span>
            <div data-testid={`action-cell-${row.orgSilServiceId}`}>
              {actionCell}
            </div>
          </div>
        );
      })}
    </div>
  )
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'orgSilService.api': 'API',
        'orgSilService.serviceType': 'Service Type',
        'orgSilService.paymentNotice': 'Payment Notice',
        'orgSilService.amountActualization': 'Amount Actualization'
      };
      return translations[key] || key;
    }
  })
}));

describe('ServiceDataGrid', () => {
  const theme = createTheme();
  const mockOnRowClick = vi.fn();

  const mockData: PagedOrgSilServiceView = {
    content: [
      {
        orgSilServiceId: 1,
        applicationName: 'Test Service 1',
        organizationId: 123,
        serviceUrl: 'http://test1.com',
        serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME
      },
      {
        orgSilServiceId: 2,
        applicationName: 'Test Service 2',
        organizationId: 123,
        serviceUrl: 'http://test2.com',
        serviceType: OrgSilServiceType.ACTUALIZATION
      }
    ],
    totalElements: 2,
    totalPages: 1,
    size: 20,
    number: 0
  };

  const defaultProps = {
    data: mockData,
    onRowClick: mockOnRowClick
  };

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <ServiceDataGrid {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render data grid with services', () => {
    renderComponent();

    expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    expect(screen.getByText('Test Service 1')).toBeInTheDocument();
    expect(screen.getByText('Test Service 2')).toBeInTheDocument();
  });

  it('should handle row click', () => {
    renderComponent();

    const actionCell = screen.getByTestId('action-cell-1');
    const arrowIcon = actionCell.querySelector('svg');

    expect(arrowIcon).toBeInTheDocument();
    fireEvent.click(arrowIcon!);

    expect(mockOnRowClick).toHaveBeenCalledWith(mockData.content[0]);
  });

  it('should render empty grid when no data', () => {
    renderComponent({ data: undefined });

    expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    expect(screen.queryByText('Test Service 1')).not.toBeInTheDocument();
  });

  it('should render with empty content array', () => {
    const emptyData = { ...mockData, content: [] };
    renderComponent({ data: emptyData });

    expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    expect(screen.queryByText('Test Service 1')).not.toBeInTheDocument();
  });
});
