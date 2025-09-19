/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '../../../__tests__/renderers';
import OperatorDetailDataGrid from './OperatorDetailDataGrid';
import { PagedDebtPositionTypeOrgDTO } from '../../../../generated/data-contracts';

// Mock ActionMenu to simple div showing menu items label and icons for testing
vi.mock('../../../components/ActionMenu/ActionMenu', () => ({
  default: (props: any) => {
    return (
      <div data-testid={`action-menu-${props.rowId}`}>
        {props.menuItems.map((item: any, idx: number) => (
          <button key={idx} onClick={item.action} aria-label={item.label}>
            {item.label}
            {item.icon}
          </button>
        ))}
      </div>
    );
  }
}));

// Mock EmptyDetailContainer as a simple div showing description
vi.mock(
  '../../../components/DebtPositionsInstallmentDetail/EmptyDetailContainer',
  () => ({
    default: (props: any) => (
      <div data-testid="empty-detail-container">{props.description}</div>
    )
  })
);

describe('OperatorDetailDataGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const sampleData = {
    content: [
      {
        debtPositionTypeOrgId: 1,
        organizationId: 10,
        debtPositionTypeId: 100,
        code: 'CODE1',
        debtPositionTypeDescription: 'Debt Desc 1',
        description: 'Description 1'
      },
      {
        debtPositionTypeOrgId: 2,
        organizationId: 11,
        debtPositionTypeId: 101,
        code: 'CODE2',
        debtPositionTypeDescription: 'Debt Desc 2',
        description: 'Description 2'
      }
    ],
    totalPages: 2
  } as PagedDebtPositionTypeOrgDTO;

  it('renders column headers correctly', () => {
    render(<OperatorDetailDataGrid data={sampleData} />);

    expect(screen.getByText('OperatorDetail.code')).toBeInTheDocument();
    expect(
      screen.getByText('OperatorDetail.debtPositionTypeDescription')
    ).toBeInTheDocument();
    expect(screen.getByText('commons.description')).toBeInTheDocument();
  });

  it('renders rows correctly', () => {
    render(<OperatorDetailDataGrid data={sampleData} />);

    sampleData.content.forEach((row) => {
      expect(screen.getByText(row.code)).toBeInTheDocument();
      expect(
        screen.getByText(row.debtPositionTypeDescription as string)
      ).toBeInTheDocument();
      expect(screen.getByText(row.description)).toBeInTheDocument();

      // Check presence of remove and navigate icons by data-testid inside the buttons
      expect(
        screen.getByTestId(`remove-detail-${row.debtPositionTypeId}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`navigate-to-detail-${row.debtPositionTypeId}`)
      ).toBeInTheDocument();
    });
  });

  it('renders EmptyDetailContainer with correct description when no data', () => {
    render(
      <OperatorDetailDataGrid
        data={{
          content: [],
          totalPages: 0,
          size: 10,
          totalElements: 0,
          number: 0
        }}
      />
    );
    expect(screen.getByTestId('empty-detail-container')).toHaveTextContent(
      'OperatorDetail.emptyData'
    );
  });
});
