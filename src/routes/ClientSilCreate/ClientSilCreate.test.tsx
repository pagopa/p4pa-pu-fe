import { render, screen, fireEvent, waitFor } from '../../__tests__/renderers';
import { vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { ClientSilCreate } from './ClientSilCreate';

// Mock the API module
const { mockMutateAsync, mockCreateClientSil } = vi.hoisted(() => ({
  mockMutateAsync: vi.fn(),
  mockCreateClientSil: vi.fn()
}));

vi.mock('../../api/clientSil', () => ({
  createClientSil: mockCreateClientSil
}));

// Mock the utils module
const { mockNotifyEmit } = vi.hoisted(() => ({
  mockNotifyEmit: vi.fn()
}));

vi.mock('../../utils', () => ({
  default: {
    notify: {
      emit: mockNotifyEmit
    }
  }
}));

// Mock react-router
const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn()
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock the routes
vi.mock('../../routes', () => ({
  PageRoutes: {
    CLIENT_SIL_INDEX: '/client-sil',
    RESPONSES_SUCCESS: '/success',
    RESPONSES_ERROR: '/error'
  }
}));

// Mock the store
vi.mock('../../store/GlobalStore', () => ({
  useStore: () => ({
    state: {
      organizationId: '123'
    }
  }),
  StoreProvider: ({ children }: { children: React.ReactNode }) => children
}));

// Mock Wizard components
vi.mock('../../components/Wizard/WizardStepWrapper', () => ({
  default: ({
    title,
    children
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="wizard-step-wrapper">
      <h2>{title}</h2>
      {children}
    </div>
  )
}));

vi.mock('../../components/Wizard/SectionBox', () => ({
  default: ({
    title,
    children,
    adornment,
    ...props
  }: {
    title: string;
    children: React.ReactNode;
    adornment: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div {...props}>
      <h3>{title}</h3>
      {adornment}
      {children}
    </div>
  )
}));

vi.mock('../../components/Wizard/WizardStepButtons', () => ({
  default: ({
    onBack,
    onNext,
    nextLabel,
    backLabel,
    disableNext,
    disableBack
  }: {
    onBack: () => void;
    onNext: () => void;
    nextLabel: string;
    backLabel: string;
    disableNext: boolean;
    disableBack: boolean;
  }) => (
    <div data-testid="wizard-step-buttons">
      <button onClick={onBack} disabled={disableBack} data-testid="back-button">
        {backLabel}
      </button>
      <button onClick={onNext} disabled={disableNext} data-testid="next-button">
        {nextLabel}
      </button>
    </div>
  )
}));

describe('ClientSilCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClientSil.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    });
  });

  const renderClientSilCreate = () => {
    return render(<ClientSilCreate />);
  };

  it('renders the component correctly', () => {
    renderClientSilCreate();

    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-step-wrapper')).toBeInTheDocument();
    expect(
      screen.getByTestId('client-sil-configuration-section')
    ).toBeInTheDocument();
    expect(screen.getByTestId('client-name-field')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-step-buttons')).toBeInTheDocument();
  });

  it('displays the correct labels and titles', () => {
    renderClientSilCreate();

    expect(screen.getByRole('textbox')).toHaveAttribute(
      'id',
      'client-name-input'
    );
    expect(screen.getByTestId('back-button')).toBeInTheDocument();
    expect(screen.getByTestId('next-button')).toBeInTheDocument();
  });

  it('validates client name field as required', async () => {
    renderClientSilCreate();

    const saveButton = screen.getByTestId('next-button');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });
  });

  it('validates client name format (alphanumeric, dash, underscore only)', async () => {
    renderClientSilCreate();

    const clientNameInput = screen
      .getByTestId('client-name-field')
      .querySelector('input')!;

    fireEvent.change(clientNameInput, { target: { value: 'invalid@name' } });
    fireEvent.blur(clientNameInput);

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });
  });

  it('accepts valid client name format', async () => {
    renderClientSilCreate();

    const clientNameInput = screen
      .getByTestId('client-name-field')
      .querySelector('input')!;

    fireEvent.change(clientNameInput, {
      target: { value: 'valid-client_name123' }
    });
    fireEvent.blur(clientNameInput);

    await waitFor(() => {
      expect(screen.getByRole('textbox')).not.toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });
  });

  it('navigates back when back button is clicked', () => {
    renderClientSilCreate();

    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/client-sil');
  });

  it('submits form successfully and navigates to success page', async () => {
    const mockResponse = {
      clientName: 'test-client',
      clientId: 'client-123'
    };
    mockMutateAsync.mockResolvedValue(mockResponse);

    renderClientSilCreate();

    const clientNameInput = screen
      .getByTestId('client-name-field')
      .querySelector('input')!;
    fireEvent.change(clientNameInput, { target: { value: 'test-client' } });

    const saveButton = screen.getByTestId('next-button');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        clientName: 'test-client'
      });
    });

    await waitFor(() => {
      expect(mockNotifyEmit).toHaveBeenCalledWith(
        expect.any(String),
        'success'
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/success', {
        replace: true,
        state: {
          category: 'client-sil',
          i18nParams: {
            clientName: 'test-client'
          },
          clientId: 'client-123'
        }
      });
    });
  });

  it('handles API error with 409 status (name already exists)', async () => {
    const axiosError = new AxiosError('Conflict', '409', undefined, undefined, {
      status: 409,
      data: {},
      statusText: 'Conflict',
      headers: {},
      config: {
        headers: new AxiosHeaders()
      }
    });
    mockMutateAsync.mockRejectedValue(axiosError);

    renderClientSilCreate();

    const clientNameInput = screen
      .getByTestId('client-name-field')
      .querySelector('input')!;
    fireEvent.change(clientNameInput, { target: { value: 'existing-client' } });

    const saveButton = screen.getByTestId('next-button');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockNotifyEmit).toHaveBeenCalledWith(expect.any(String), 'error');
    });

    expect(mockNavigate).not.toHaveBeenCalledWith('/error');
  });

  it('handles generic API error and navigates to error page', async () => {
    const genericError = new Error('Generic error');
    mockMutateAsync.mockRejectedValue(genericError);

    renderClientSilCreate();

    const clientNameInput = screen
      .getByTestId('client-name-field')
      .querySelector('input')!;
    fireEvent.change(clientNameInput, { target: { value: 'test-client' } });

    const saveButton = screen.getByTestId('next-button');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/error');
    });
  });

  it('disables form elements when mutation is pending', () => {
    mockCreateClientSil.mockReturnValueOnce({
      mutateAsync: mockMutateAsync,
      isPending: true
    });

    renderClientSilCreate();

    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByTestId('next-button')).toBeDisabled();
    expect(screen.getByTestId('back-button')).toBeDisabled();
  });

  it('calls createClientSil with correct organizationId', () => {
    renderClientSilCreate();

    expect(mockCreateClientSil).toHaveBeenCalledWith(123);
  });

  it('prevents submission when form is invalid', async () => {
    renderClientSilCreate();

    // Leave client name empty
    const saveButton = screen.getByTestId('next-button');
    fireEvent.click(saveButton);

    // Wait a bit to ensure no API call is made
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
});
