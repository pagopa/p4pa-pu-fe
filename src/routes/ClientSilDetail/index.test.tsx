import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, render } from '../../__tests__/renderers';
import { getClientDetail } from '../../api/clientSil';
import clientSilApi from '../../api/clientSil';
import ClientSilDetail from '.';

vi.mock('../../api/clientSil', () => ({
  getClientDetail: vi.fn(),
  deleteClientSil: vi.fn(),
  generateClientSecret: vi.fn(),
  default: {
    getClientDetail: vi.fn(),
    deleteClientSil: vi.fn(),
    generateClientSecret: vi.fn()
  }
}));

vi.mock('../../utils', () => ({
  default: {
    dialog: {
      open: vi.fn(),
      close: vi.fn(),
      status: {
        isDialogVisible: { value: false },
        dialogPayload: { value: { title: '', open: false } }
      }
    },
    config: {
      deployPath: '/piattaformaunitaria'
    },
    notify: {
      emit: vi.fn()
    }
  }
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: () => ({ clientId: 'IPA_TEST_ID' }),
    Navigate: vi.fn(({ to }: { to: string }) => <div>Navigate to {to}</div>),
    useNavigate: () => vi.fn()
  };
});

describe('ClientSIL Detail Page', () => {
  const dataMock = {
    clientId: 'IPA_TEST_ID',
    clientName: 'IPA_TEST_NAME',
    organizationIpaCode: 'IPA_TEST',
    clientSecret: '000111'
  };

  beforeEach(() => {
    vi.clearAllMocks();

    const mockGetClientSilDetail = getClientDetail as ReturnType<typeof vi.fn>;
    mockGetClientSilDetail.mockReturnValue({
      data: dataMock,
      isPending: false,
      isError: false,
      error: null
    });

    // Mock the default export methods
    const mockDeleteClientSil = clientSilApi.deleteClientSil as ReturnType<typeof vi.fn>;
    mockDeleteClientSil.mockReturnValue({
      mutateAsync: vi.fn()
    });
  });

  it('renders ClientSIL Detail without crashing', async () => {
    render(<ClientSilDetail />);

    expect(screen.getByText(dataMock.clientId)).toBeInTheDocument();
  });
});
