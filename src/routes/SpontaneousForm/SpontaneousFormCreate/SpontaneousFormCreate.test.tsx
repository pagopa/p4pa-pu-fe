import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor
} from '../../../__tests__/renderers';
import { useNavigate } from 'react-router';
import SpontaneousFormCreate from './SpontaneousFormCreate';
import { PageRoutes } from '../..';

const mockMutateAsync = vi.fn();

const { mockCreateSpontaneousForm } = vi.hoisted(() => ({
  mockCreateSpontaneousForm: vi.fn(() => ({
    mutateAsync: mockMutateAsync,
    isPending: false
  }))
}));

vi.mock('../../../api/spontaneousForm', () => ({
  default: {
    createSpontaneousForm: mockCreateSpontaneousForm
  }
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

vi.mock('../../../store/GlobalStore', () => ({
  useStore: () => ({
    state: {
      organizationId: 123,
      APP_STATE: { loading: false, customBreadcrumbsItems: [] }
    },
    setState: vi.fn()
  }),
  StoreProvider: ({ children }: React.PropsWithChildren<object>) => children
}));

describe('SpontaneousFormCreate', () => {
  const navigateMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(navigateMock);
    mockMutateAsync.mockResolvedValue({});
    mockCreateSpontaneousForm.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    });
  });

  it('renders the form with all required fields', () => {
    render(<SpontaneousFormCreate />);

    expect(
      screen.getByText('spontaneousForm.create.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('spontaneousForm.create.description')
    ).toBeInTheDocument();
    expect(
      screen.getByText('spontaneousForm.create.formConfiguration')
    ).toBeInTheDocument();
    expect(
      screen.getByText('commons.requiredFieldDescription')
    ).toBeInTheDocument();
    expect(
      screen.getByText('spontaneousForm.create.generalConfiguration')
    ).toBeInTheDocument();
    expect(
      screen.getByText('spontaneousForm.create.translations')
    ).toBeInTheDocument();
  });

  it('renders code input field', () => {
    render(<SpontaneousFormCreate />);

    const codeInput = screen.getByTestId('code');
    expect(codeInput).toBeInTheDocument();
  });

  it('renders structure textarea field', () => {
    render(<SpontaneousFormCreate />);

    const structureInput = screen.getByTestId('structure');
    expect(structureInput).toBeInTheDocument();
  });

  it('renders dictionary textarea field', () => {
    render(<SpontaneousFormCreate />);

    const dictionaryInput = screen.getByTestId('dictionary');
    expect(dictionaryInput).toBeInTheDocument();
  });

  it('renders back and submit buttons', () => {
    render(<SpontaneousFormCreate />);

    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.getByText('commons.back')).toBeInTheDocument();
    expect(screen.getByText('commons.add')).toBeInTheDocument();
  });

  it('navigates back to index page when cancel button is clicked', () => {
    render(<SpontaneousFormCreate />);

    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);

    expect(navigateMock).toHaveBeenCalledWith(
      PageRoutes.SPONTANEOUS_FORM_INDEX
    );
  });

  it('shows validation errors when submitting empty form', async () => {
    render(<SpontaneousFormCreate />);

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    // FIX: Controlliamo se l'elemento interno (InputBase) ha la classe Mui-error,
    // dato che il wrapper esterno (FormControl) non la eredita sempre direttamente in questa versione di MUI.
    await waitFor(() => {
      const codeField = screen.getByTestId('code');
      expect(codeField.querySelector('.MuiInputBase-root')).toHaveClass(
        'Mui-error'
      );
    });

    await waitFor(() => {
      const structureField = screen.getByTestId('structure');
      expect(structureField.querySelector('.MuiInputBase-root')).toHaveClass(
        'Mui-error'
      );
    });
  });

  it('shows validation error when only code is filled', async () => {
    render(<SpontaneousFormCreate />);

    const codeInput = screen.getByTestId('code').querySelector('input');
    if (codeInput) {
      fireEvent.change(codeInput, { target: { value: 'TEST_CODE' } });
    }

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const structureField = screen.getByTestId('structure');
      expect(structureField.querySelector('.MuiInputBase-root')).toHaveClass(
        'Mui-error'
      );
    });
  });

  it('submits form successfully and navigates to success page', async () => {
    render(<SpontaneousFormCreate />);

    const codeInput = screen.getByTestId('code').querySelector('input');
    const structureInput = screen
      .getByTestId('structure')
      .querySelector('textarea');

    if (codeInput && structureInput) {
      fireEvent.change(codeInput, { target: { value: 'TEST_CODE' } });
      fireEvent.change(structureInput, {
        target: { value: '{"fields":[]}' }
      });
    }

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        organizationId: 123,
        code: 'TEST_CODE',
        structure: { fields: [] },
        dictionary: undefined
      });
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(PageRoutes.RESPONSES_SUCCESS, {
        state: {
          category: 'spontaneous-form-create',
          i18nParams: { formCode: 'TEST_CODE' }
        }
      });
    });
  });

  it('submits form with dictionary and navigates to success page', async () => {
    render(<SpontaneousFormCreate />);

    const codeInput = screen.getByTestId('code').querySelector('input');
    const structureInput = screen
      .getByTestId('structure')
      .querySelector('textarea');
    const dictionaryInput = screen
      .getByTestId('dictionary')
      .querySelector('textarea');

    if (codeInput && structureInput && dictionaryInput) {
      fireEvent.change(codeInput, { target: { value: 'TEST_CODE' } });
      fireEvent.change(structureInput, {
        target: { value: '{"fields":[]}' }
      });
      fireEvent.change(dictionaryInput, {
        target: { value: '{"IT":{"field":{"label":"Test"}}}' }
      });
    }

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        organizationId: 123,
        code: 'TEST_CODE',
        structure: { fields: [] },
        dictionary: { IT: { field: { label: 'Test' } } }
      });
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(PageRoutes.RESPONSES_SUCCESS, {
        state: {
          category: 'spontaneous-form-create',
          i18nParams: { formCode: 'TEST_CODE' }
        }
      });
    });
  });

  it('navigates to error page when API call fails', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('API Error'));

    render(<SpontaneousFormCreate />);

    const codeInput = screen.getByTestId('code').querySelector('input');
    const structureInput = screen
      .getByTestId('structure')
      .querySelector('textarea');

    if (codeInput && structureInput) {
      fireEvent.change(codeInput, { target: { value: 'TEST_CODE' } });
      fireEvent.change(structureInput, {
        target: { value: '{"fields":[]}' }
      });
    }

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR, {
        state: {
          errorType: 'spontaneous-form-create'
        }
      });
    });
  });

  it('disables submit button when mutation is pending', () => {
    mockCreateSpontaneousForm.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true
    });

    render(<SpontaneousFormCreate />);

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeDisabled();
  });

  it('trims whitespace from code before submission', async () => {
    render(<SpontaneousFormCreate />);

    const codeInput = screen.getByTestId('code').querySelector('input');
    const structureInput = screen
      .getByTestId('structure')
      .querySelector('textarea');

    if (codeInput && structureInput) {
      fireEvent.change(codeInput, { target: { value: '  TEST_CODE  ' } });
      fireEvent.change(structureInput, {
        target: { value: '{"fields":[]}' }
      });
    }

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'TEST_CODE'
        })
      );
    });
  });

  it('does not call API when form validation fails', async () => {
    render(<SpontaneousFormCreate />);

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const codeField = screen.getByTestId('code');
      expect(codeField.querySelector('.MuiInputBase-root')).toHaveClass(
        'Mui-error'
      );
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });
});
