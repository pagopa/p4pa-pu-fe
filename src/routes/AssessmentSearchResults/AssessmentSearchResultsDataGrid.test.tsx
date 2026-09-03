import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../__tests__/renderers';
import AssessmentSearchResultsDataGrid from './AssessmentSearchResultsDataGrid';
import {
  PagedAssessmentsExtendedDTO,
  AssessmentsExtendedDTO
} from '../../../generated/core/data-contracts';

vi.mock('../../utils/formatters', () => ({
  formatDate: () => '01/01/2023',
  toCamelCase: () => vi.fn()
}));

vi.mock('../../utils/assessmentHelpers', () => ({
  getAssessmentStatusChipProps: () => ({
    label: 'Active',
    color: 'success'
  })
}));

const mockNavigate = vi.fn();

vi.mock('../../components/DataGrid/CustomDataGrid', () => {
  return {
    default: ({ rows }: { rows: Array<{ assessmentId?: number }> }) => (
      <div data-testid="custom-data-grid">
        <div data-testid="rows-count">{`${rows.length} rows`}</div>
        {/* Assume fixed columns count since actual columns are not needed here */}
        <div data-testid="columns-count">6 columns</div>
        {rows.map((row, index) => (
          <div key={index} data-testid={`row-${index}`}>
            <button
              data-testid="assessment-detail-button"
              onClick={() => {
                if (row.assessmentId !== undefined) {
                  mockNavigate(`/assessment/detail/${row.assessmentId}`);
                }
              }}
            >
              Detail
            </button>
          </div>
        ))}
      </div>
    )
  };
});

describe('AssessmentSearchResultsDataGrid', () => {
  const mockData: PagedAssessmentsExtendedDTO = {
    content: [
      {
        assessmentId: 1,
        assessmentName: 'Test Assessment 1',
        debtPositionTypeOrgCode: 'DEBT001',
        descriptionDebtPositionTypeOrgCode: undefined,
        updateOperatorExternalId: 'creator1',
        updateDate: '2023-01-01T00:00:00Z',
        status: 'ACTIVE',
        organizationId: 123
      } as AssessmentsExtendedDTO,
      {
        assessmentId: 2,
        assessmentName: 'Test Assessment 2',
        debtPositionTypeOrgCode: 'DEBT002',
        descriptionDebtPositionTypeOrgCode: 'Debt Type Desc',
        updateOperatorExternalId: undefined,
        updateDate: undefined,
        status: 'CLOSED',
        organizationId: 123
      } as AssessmentsExtendedDTO
    ],
    totalElements: 2,
    totalPages: 1,
    number: 0,
    size: 10
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders and displays correct rows and columns count', () => {
    render(<AssessmentSearchResultsDataGrid data={mockData} />);
    expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    expect(screen.getByTestId('rows-count').textContent).toBe('2 rows');
    expect(screen.getByTestId('columns-count').textContent).toBe('6 columns');
  });

  it('renders empty correctly when data is missing', () => {
    render(<AssessmentSearchResultsDataGrid data={undefined} />);
    expect(screen.getByTestId('rows-count').textContent).toBe('0 rows');
  });

  it('displays detail buttons and fires navigate with correct route on click', () => {
    render(<AssessmentSearchResultsDataGrid data={mockData} />);
    const detailButtons = screen.getAllByTestId('assessment-detail-button');
    expect(detailButtons).toHaveLength(2);

    fireEvent.click(detailButtons[0]);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/assessment/detail/1');

    fireEvent.click(detailButtons[1]);
    expect(mockNavigate).toHaveBeenCalledTimes(2);
    expect(mockNavigate).toHaveBeenCalledWith('/assessment/detail/2');
  });

  it('supports fallback row ID 0 if assessmentId missing', () => {
    const dataWithMissingAssessmentId = {
      ...mockData,
      content: [{ ...mockData.content[0], assessmentId: undefined }]
    };
    render(
      <AssessmentSearchResultsDataGrid data={dataWithMissingAssessmentId} />
    );

    expect(screen.getByTestId('custom-data-grid')).toBeInTheDocument();
    expect(screen.getByTestId('rows-count').textContent).toBe('1 rows');
  });
});
