import { vi } from 'vitest';
import OperatorSelector from './OperatorSelector';
import {
  render,
  screen,
  fireEvent,
  waitFor
} from '../../../../__tests__/renderers';
import { i18nTestSetup } from '../../../../__tests__/i18nTestSetup';
import * as api from '../../../../api/debtPositionTypeOrgOperators';

i18nTestSetup({
  'commons.operator': 'Operatore',
  'commons.deleteSelection': 'Cancella selezione',
  'commons.selectedOperator': 'operatori selezionati'
});

const mockApiResponse = {
  content: [
    {
      operatorId: 'op1',
      mappedExternalUserId: 'ext1',
      firstName: 'John',
      lastName: 'Doe',
      enabled: true
    },
    {
      operatorId: 'op2',
      mappedExternalUserId: 'ext2',
      firstName: 'Jane',
      lastName: 'Smith',
      enabled: false
    },
    {
      operatorId: 'op3',
      mappedExternalUserId: null,
      firstName: 'Bob',
      lastName: 'Johnson',
      enabled: true
    }
  ],
  totalPages: 2,
  number: 0,
  size: 10
};

describe('OperatorSelector', () => {
  vi.mock('../../../../api/debtPositionTypeOrgOperators', () => ({
    getDebtPositionTypeOrgOperators: vi.fn(() => ({
      data: mockApiResponse,
      isLoading: false,
      error: null
    }))
  }));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the operator grid with correct data', async () => {
    const onSelectionChangeMock = vi.fn();

    render(
      <OperatorSelector
        organizationId={3}
        onSelectionChange={onSelectionChangeMock}
        enabledOperators={[]}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    expect(screen.getByText('Operatore')).toBeInTheDocument();
  });

  it('handles selection changes correctly', async () => {
    const onSelectionChangeMock = vi.fn();

    render(
      <OperatorSelector
        organizationId={3}
        onSelectionChange={onSelectionChangeMock}
        enabledOperators={[]}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);

    expect(onSelectionChangeMock).toHaveBeenCalledWith(['ext1']);
  });

  it('initializes with pre-selected operators', async () => {
    const onSelectionChangeMock = vi.fn();

    render(
      <OperatorSelector
        organizationId={3}
        onSelectionChange={onSelectionChangeMock}
        enabledOperators={['ext1']}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[1]).toBeChecked();
  });

  it('clears selection when clear button is clicked', async () => {
    const onSelectionChangeMock = vi.fn();

    render(
      <OperatorSelector
        organizationId={3}
        onSelectionChange={onSelectionChangeMock}
        enabledOperators={['ext1', 'ext2']}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(/\(2\) operatori selezionati/)
      ).toBeInTheDocument();
    });

    const clearButton = screen.getByText('Cancella selezione');
    fireEvent.click(clearButton);

    expect(onSelectionChangeMock).toHaveBeenCalledWith([]);
  });

  it('handles pagination correctly', async () => {
    const onSelectionChangeMock = vi.fn();
    const getDebtPositionTypeOrgOperatorsSpy = vi.spyOn(
      api,
      'getDebtPositionTypeOrgOperators'
    );

    render(
      <OperatorSelector
        organizationId={3}
        onSelectionChange={onSelectionChangeMock}
        enabledOperators={[]}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const paginationButtons = screen.getAllByRole('button');
    const page2Button = paginationButtons.find(
      (button) => button.textContent === '2'
    );
    if (page2Button) {
      fireEvent.click(page2Button);
    }

    expect(getDebtPositionTypeOrgOperatorsSpy).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ page: 1, size: 10 })
    );
  });

  it('handles sort model change correctly', async () => {
    const onSelectionChangeMock = vi.fn();
    const getDebtPositionTypeOrgOperatorsSpy = vi.spyOn(
      api,
      'getDebtPositionTypeOrgOperators'
    );

    render(
      <OperatorSelector
        organizationId={3}
        onSelectionChange={onSelectionChangeMock}
        enabledOperators={[]}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const columnHeader = screen.getByText('Operatore');
    fireEvent.click(columnHeader);

    expect(getDebtPositionTypeOrgOperatorsSpy).toHaveBeenCalled();
  });

  it('shows correct selection count in alert', async () => {
    const onSelectionChangeMock = vi.fn();

    render(
      <OperatorSelector
        organizationId={3}
        onSelectionChange={onSelectionChangeMock}
        enabledOperators={[]}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.queryByText(/operatori selezionati/)).not.toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    fireEvent.click(checkboxes[2]);

    expect(screen.getByText(/\(2\) operatori selezionati/)).toBeInTheDocument();
  });
});
