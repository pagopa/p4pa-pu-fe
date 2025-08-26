/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '../../../__tests__/renderers';
import AssessmentDetailDataGrid from './AssessmentDetailDataGrid';

// Mock CustomDataGrid component that just renders rows and simulates action button
vi.mock('../../../components/DataGrid/CustomDataGrid', () => ({
  default: (props: any) => {
    const { rows, columns, loading, getRowId } = props;
    const actionCol = columns.find((c: any) => c.field === 'action');

    return (
      <div data-testid="custom-data-grid">
        {loading ? (
          <div data-testid="loading-indicator">Loading...</div>
        ) : (
          <>
            <div data-testid="rows-count">{rows.length} rows</div>
            <div data-testid="columns-count">{columns.length} columns</div>
            {rows.map((row: any, idx: number) => (
              <div key={idx} data-testid={`row-${idx}`}>
                <span data-testid={`row-id-${idx}`}>
                  {getRowId ? getRowId(row) : row.assessmentDetailId || idx}
                </span>
                <span data-testid={`iuv-${idx}`}>{row.iuv}</span>
                {row.receiptId && actionCol && (
                  <button
                    data-testid={`navigate-to-detail-${row.receiptId}`}
                    onClick={() => {
                      if (props.onNavigateToDetail) {
                        props.onNavigateToDetail(row.receiptId);
                      }
                    }}
                  >
                    Go
                  </button>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    );
  }
}));

vi.mock('../../../utils/formatters', async (importOriginal) => {
  return await importOriginal();
});

describe('AssessmentDetailDataGrid - Simple tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const sampleRows = [
    {
      assessmentDetailId: 1,
      iuv: 'IUV123',
      amountCents: 12345,
      paymentDateTime: '2025-01-01T00:00:00Z',
      updateDate: '2025-01-02T00:00:00Z',
      receiptId: 10
    },
    {
      assessmentDetailId: 2,
      iuv: 'IUV456',
      amountCents: 67890,
      paymentDateTime: '2025-02-01T00:00:00Z',
      updateDate: '2025-02-02T00:00:00Z',
      receiptId: 20
    }
  ];

  it('renders rows and columns count correctly', () => {
    render(
      <AssessmentDetailDataGrid
        data={
          {
            pagedAssessmentsRowsDetail: { content: sampleRows, totalPages: 1 }
          } as any
        }
      />
    );

    expect(screen.getByTestId('rows-count').textContent).toBe('2 rows');
    expect(screen.getByTestId('columns-count').textContent).toBe('5 columns');
  });

  it('shows loading indicator when isLoading is true', () => {
    render(
      <AssessmentDetailDataGrid
        isLoading
        data={
          {
            pagedAssessmentsRowsDetail: { content: sampleRows, totalPages: 1 }
          } as any
        }
      />
    );

    expect(screen.getByTestId('loading-indicator')).toBeDefined();
  });

  it('renders correctly with no data', () => {
    render(<AssessmentDetailDataGrid />);

    expect(screen.getByTestId('rows-count').textContent).toBe('0 rows');
  });
});
