import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor
} from '../../../__tests__/renderers';
import { useNavigate, useParams } from 'react-router';
import SpontaneousFormEdit from './SpontaneousFormEdit';
import { PageRoutes } from '../..';

const mockFormDetail = {
  spontaneousFormId: 1,
  code: 'FORM_001',
  organizationId: 123,
  debtPositionTypeOrgCount: 0,
  structure: {
    fields: [
      {
        name: 'testField',
        required: true,
        htmlRender: 'TEXT',
        insertableOrder: 1,
        indexable: false,
        renderableOrder: 1,
        searchableOrder: 1,
        listableOrder: 1,
        insertable: true,
        renderable: true,
        searchable: true,
        listable: true,
        association: false,
        detailLink: false,
        minOccurences: 0,
        maxOccurences: 1
      }
    ]
  },
  dictionary: {
    IT: {
      testField: {
        label: 'Campo Test'
      }
    }
  }
};

const mockMutateAsync = vi.fn();

const { mockUpdateSpontaneousForm, mockGetSpontaneousFormById } = vi.hoisted(
  () => ({
    mockUpdateSpontaneousForm: vi.fn(() => ({
      mutateAsync: mockMutateAsync,
      isPending: false
    })),
    mockGetSpontaneousFormById: vi.fn()
  })
);

vi.mock('../../../api/spontaneousForm', () => ({
  default: {
    updateSpontaneousForm: mockUpdateSpontaneousForm,
    getSpontaneousFormById: mockGetSpontaneousFormById
  }
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn()
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

describe('SpontaneousFormEdit', () => {
  const navigateMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(navigateMock);
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
      spontaneousFormId: '1'
    });
    mockMutateAsync.mockResolvedValue({});
    mockUpdateSpontaneousForm.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    });
    mockGetSpontaneousFormById.mockReturnValue({
      data: { response: mockFormDetail },
      isLoading: false
    });
  });

  it('renders the edit form with pre-populated data', () => {
    render(<SpontaneousFormEdit />);

    expect(screen.getByText('spontaneousForm.edit.title')).toBeInTheDocument();
    expect(
      screen.getByText('spontaneousForm.edit.description')
    ).toBeInTheDocument();

    const codeInput = screen.getByTestId('code').querySelector('input');
    expect(codeInput).toHaveValue('FORM_001');
  });

  it('renders code field as disabled/readonly in edit mode', () => {
    render(<SpontaneousFormEdit />);

    const codeInput = screen.getByTestId('code').querySelector('input');
    expect(codeInput).toBeDisabled();
  });

  it('pre-populates structure field with formatted JSON', () => {
    render(<SpontaneousFormEdit />);

    const structureInput = screen
      .getByTestId('structure')
      .querySelector('textarea');
    expect(structureInput?.value).toContain('testField');
  });

  it('pre-populates dictionary field with formatted JSON', () => {
    render(<SpontaneousFormEdit />);

    const dictionaryInput = screen
      .getByTestId('dictionary')
      .querySelector('textarea');
    expect(dictionaryInput?.value).toContain('Campo Test');
  });

  it('navigates back to index when cancel button is clicked', () => {
    render(<SpontaneousFormEdit />);

    const cancelButton = screen.getByTestId('cancel-button');
    fireEvent.click(cancelButton);

    expect(navigateMock).toHaveBeenCalledWith(
      PageRoutes.SPONTANEOUS_FORM_INDEX
    );
  });

  it('shows save button instead of add button', () => {
    render(<SpontaneousFormEdit />);

    expect(screen.getByText('commons.save')).toBeInTheDocument();
    expect(screen.queryByText('commons.add')).not.toBeInTheDocument();
  });

  it('submits update and navigates to success page', async () => {
    render(<SpontaneousFormEdit />);

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: 123,
          spontaneousFormId: 1,
          code: 'FORM_001'
        })
      );
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(PageRoutes.RESPONSES_SUCCESS, {
        state: {
          category: 'spontaneous-form-edit',
          i18nParams: { formCode: 'FORM_001' }
        }
      });
    });
  });

  it('navigates to error page when API call fails', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('API Error'));

    render(<SpontaneousFormEdit />);

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(PageRoutes.RESPONSES_ERROR, {
        state: {
          errorType: 'spontaneous-form-edit'
        }
      });
    });
  });

  it('disables submit button when mutation is pending', () => {
    mockUpdateSpontaneousForm.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true
    });

    render(<SpontaneousFormEdit />);

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeDisabled();
  });

  it('renders nothing while loading', () => {
    mockGetSpontaneousFormById.mockReturnValue({
      data: undefined,
      isLoading: true
    });

    const { container } = render(<SpontaneousFormEdit />);
    expect(container.firstChild).toBeNull();
  });

  it('allows editing structure field', async () => {
    render(<SpontaneousFormEdit />);

    const structureInput = screen
      .getByTestId('structure')
      .querySelector('textarea');

    if (structureInput) {
      fireEvent.change(structureInput, {
        target: { value: '{"fields":[{"name":"newField"}]}' }
      });
    }

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          structure: { fields: [{ name: 'newField' }] }
        })
      );
    });
  });

  it('handles form without dictionary', () => {
    const formWithoutDictionary = {
      ...mockFormDetail,
      dictionary: undefined
    };
    mockGetSpontaneousFormById.mockReturnValue({
      data: { response: formWithoutDictionary },
      isLoading: false
    });

    render(<SpontaneousFormEdit />);

    const dictionaryInput = screen
      .getByTestId('dictionary')
      .querySelector('textarea');
    expect(dictionaryInput?.value).toBe('');
  });
});
