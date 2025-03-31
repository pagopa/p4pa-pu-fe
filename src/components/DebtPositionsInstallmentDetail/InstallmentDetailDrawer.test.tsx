import { render, screen } from '../../__tests__/renderers';
import { vi, Mock } from 'vitest';
import { getTransfers } from '../../api/transfers';
import {
  InstallmentDetailDrawerProps,
  InstallmentDetailDrawer
} from './InstallmentDetailDrawer';
import { moneyFormat } from '../../utils/formatters';
import { TransferDTO } from '../../../generated/data-contracts';

vi.mock('../../api/transfers', () => ({
  getTransfers: vi.fn()
}));

const renderComponent = (props: Partial<InstallmentDetailDrawerProps> = {}) => {
  return render(
    <InstallmentDetailDrawer
      open={true}
      title="InstallmentDrawer title"
      onClose={vi.fn()}
      organizationId={1}
      installmentId={1}
      {...props}
    />
  );
};

describe('InstallmentDetailDrawer', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders transfers when query is successful', async () => {
    const mockTransfer: TransferDTO = {
      transferId: 123,
      amountCents: 10000,
      category: 'Tax',
      iban: 'IT60X0542811101000000123456',
      orgFiscalCode: '12345678901',
      orgName: 'Organization A',
      remittanceInformation: '',
      transferIndex: 0
    };

    (getTransfers as Mock).mockReturnValue({
      data: [mockTransfer],
      isSuccess: true
    });

    renderComponent();

    expect(
      await screen.findByText('Organization A'.toUpperCase())
    ).toBeInTheDocument();
    expect(screen.getByText('importo')).toBeInTheDocument();
    expect(
      screen.getByText(
        moneyFormat(mockTransfer.amountCents as number).replace(/\s/g, ' ')
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Codice fiscale')).toBeInTheDocument();
    expect(screen.getByText('12345678901')).toBeInTheDocument();
  });

  it('renders nothing when transfers are empty', async () => {
    (getTransfers as Mock).mockReturnValue({
      data: [],
      isSuccess: true
    });

    renderComponent();

    expect(screen.queryByText('importo')).not.toBeInTheDocument();
  });
});
