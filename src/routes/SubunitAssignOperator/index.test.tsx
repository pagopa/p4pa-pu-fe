import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { SubunitAssignOperator } from './index';

const {
  mockNavigate,
  mockApplyFilters,
  mockMutateAsync,
  mockNotify,
  mockDialogOpen,
  mockDialogClose
} = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockApplyFilters: vi.fn(),
  mockMutateAsync: vi.fn(),
  mockNotify: vi.fn(),
  mockDialogOpen: vi.fn<(options: { onConfirm: () => void }) => void>(),
  mockDialogClose: vi.fn()
}));

vi.mock('react-router', () => ({
  generatePath: (_route: string, params: Record<string, string>) =>
    `/${params.organizationId}/${params.subUnitCode}`,
  useNavigate: () => mockNavigate,
  useParams: () => ({ organizationId: '12', subUnitCode: 'UNIT-1' })
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>
}));

vi.mock('@core/api/orgSubUnit', () => ({
  getOrgSubUnitNotRelatedOperators: vi.fn(),
  useAddOperatorsToOrgSubUnit: () => ({ mutateAsync: mockMutateAsync })
}));

vi.mock('@core/hooks/useSearch', () => ({
  useSearch: () => ({
    query: { data: { content: [], totalPages: 1 } },
    applyFilters: mockApplyFilters
  })
}));

vi.mock('@core/utils', () => ({
  default: {
    URI: { decode: () => ({}) },
    notify: { emit: mockNotify },
    dialog: { open: mockDialogOpen, close: mockDialogClose }
  }
}));

vi.mock('@core/components/TitleComponent/TitleComponent', () => ({
  default: () => null
}));
vi.mock('@core/components/FilterContainer/FilterContainer', () => ({
  default: ({
    onChange,
    items
  }: {
    onChange: (id: string, value: string) => void;
    items: Array<{ onClick?: () => void }>;
  }) => (
    <div>
      <button onClick={() => onChange('lastName', 'Smith')}>
        Change filter
      </button>
      <button onClick={items[2].onClick}>Apply filters</button>
    </div>
  ),
  COMPONENT_TYPE: { textField: 'textField', button: 'button' }
}));
vi.mock('@core/components/GridSelector', () => ({
  GridSelector: ({
    onSelectionChange
  }: {
    onSelectionChange: (ids: Array<string>) => void;
  }) => (
    <button onClick={() => onSelectionChange(['operator-1'])}>
      Select operator
    </button>
  )
}));
vi.mock('@core/components/Wizard/WizardStepButtons', () => ({
  default: ({ onBack, onNext }: { onBack: () => void; onNext: () => void }) => (
    <div>
      <button onClick={onBack}>Back</button>
      <button onClick={onNext}>Next</button>
    </div>
  )
}));
vi.mock('..', () => ({
  PageRoutes: { SUB_UNIT_DETAIL: '/subunit', OPERATORS_DETAIL: '/operators' }
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockMutateAsync.mockResolvedValue(undefined);
});

describe('SubunitAssignOperator', () => {
  it('renders without crashing', () => {
    const { container } = render(<SubunitAssignOperator />);

    expect(container.firstChild).not.toBeNull();
  });

  it('renders consistently when rerendered', () => {
    const { container, rerender } = render(<SubunitAssignOperator />);
    const initialMarkup = container.innerHTML;

    rerender(<SubunitAssignOperator />);

    expect(container.innerHTML).toBe(initialMarkup);
  });

  it('cleans up when unmounted', () => {
    const { container, unmount } = render(<SubunitAssignOperator />);

    unmount();

    expect(container).toBeEmptyDOMElement();
  });

  it('applies changed filters', () => {
    render(<SubunitAssignOperator />);

    fireEvent.click(screen.getByText('Change filter'));
    fireEvent.click(screen.getByText('Apply filters'));

    expect(mockApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({ lastName: 'Smith' })
    );
  });

  it('notifies when submitting without a selection', () => {
    render(<SubunitAssignOperator />);

    fireEvent.click(screen.getByText('Next'));

    expect(mockNotify).toHaveBeenCalledWith(
      'subunits.assignOperators.dialog.noSelection'
    );
    expect(mockDialogOpen).not.toHaveBeenCalled();
  });

  it('adds selected operators after dialog confirmation', async () => {
    render(<SubunitAssignOperator />);

    fireEvent.click(screen.getByText('Select operator'));
    fireEvent.click(screen.getByText('Next'));

    expect(mockDialogOpen).toHaveBeenCalledWith(
      expect.objectContaining({ 'data-testid': 'operator-subunits-dialog' })
    );
    const dialogOptions = mockDialogOpen.mock.calls[0][0];

    await act(async () => {
      dialogOptions.onConfirm();
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      mappedExternalUserIds: ['operator-1']
    });
    expect(mockDialogClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/12/UNIT-1');
    expect(mockNotify).toHaveBeenCalledWith('commons.done', 'success');
  });

  it('navigates back to the operators detail page', () => {
    render(<SubunitAssignOperator />);

    fireEvent.click(screen.getByText('Back'));

    expect(mockNavigate).toHaveBeenCalledWith('/12/UNIT-1');
  });
});
