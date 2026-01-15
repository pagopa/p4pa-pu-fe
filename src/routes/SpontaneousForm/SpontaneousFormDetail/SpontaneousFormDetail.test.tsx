import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor
} from '../../../__tests__/renderers';
import { AxiosError, AxiosHeaders } from 'axios';
import SpontaneousFormDetail from './SpontaneousFormDetail';

const mockFormDetail = {
  spontaneousFormId: 1,
  code: 'FORM_001',
  organizationId: 123,
  debtPositionTypeOrgCount: 22,
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
    ],
    amountFieldName: 'amount'
  },
  dictionary: {
    EN: {
      testField: {
        label: 'Test Field',
        error: 'Field is required',
        help: 'Enter a value'
      }
    }
  },
  creationDate: '2024-01-15T10:30:00Z',
  updateDate: '2024-01-16T14:20:00Z'
};

const mockFormDetailWithoutStructureAndDictionary = {
  spontaneousFormId: 2,
  code: 'FORM_002',
  organizationId: 123,
  debtPositionTypeOrgCount: 5,
  structure: {
    fields: []
  },
  creationDate: '2024-01-15T10:30:00Z',
  updateDate: '2024-01-16T14:20:00Z'
};

const mockFormDetailWithNullCount = {
  spontaneousFormId: 3,
  code: 'FORM_003',
  organizationId: 123,
  debtPositionTypeOrgCount: undefined,
  structure: {
    fields: [{ name: 'field' }]
  },
  dictionary: {
    IT: { field: { label: 'Campo' } }
  }
};

const {
  mockMutateAsync,
  mockGetSpontaneousFormById,
  mockDeleteSpontaneousForm,
  mockNotify,
  mockGeneratePath,
  mockNavigate
} = vi.hoisted(() => {
  const mockMutateAsync = vi.fn();
  return {
    mockMutateAsync,
    mockGetSpontaneousFormById: vi.fn(),
    mockDeleteSpontaneousForm: vi.fn(() => ({
      mutateAsync: mockMutateAsync,
      isPending: false
    })),
    mockNotify: {
      emit: vi.fn()
    },
    mockGeneratePath: vi.fn().mockReturnValue('/backoffice/spontaneous-form'),
    mockNavigate: vi.fn()
  };
});

vi.mock('../../../api/spontaneousForm', () => ({
  default: {
    getSpontaneousFormById: mockGetSpontaneousFormById,
    deleteSpontaneousForm: mockDeleteSpontaneousForm
  }
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ spontaneousFormId: '1' }),
    useNavigate: vi.fn().mockReturnValue(mockNavigate),
    generatePath: mockGeneratePath
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

vi.mock('../../../utils', () => ({
  default: {
    notify: mockNotify
  }
}));

vi.mock('../..', () => ({
  PageRoutes: {
    SPONTANEOUS_FORM_INDEX: '/backoffice/spontaneous-form'
  }
}));

const createAxiosError = (status: number): AxiosError => {
  const error = new AxiosError('Request failed');
  error.response = {
    status,
    statusText: status === 409 ? 'Conflict' : 'Internal Server Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: {}
  };
  return error;
};

describe('SpontaneousFormDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue(undefined);
  });

  describe('when data is loaded successfully', () => {
    beforeEach(() => {
      mockGetSpontaneousFormById.mockReturnValue({
        data: { response: mockFormDetail },
        isLoading: false,
        isError: false
      });
    });

    it('renders page title with form code', () => {
      render(<SpontaneousFormDetail />);

      const title = screen.getByTestId('main-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('FORM_001');
    });

    it('renders page description', () => {
      render(<SpontaneousFormDetail />);

      expect(
        screen.getByText('spontaneousForm.detail.description')
      ).toBeInTheDocument();
    });

    it('renders form configuration section title', () => {
      render(<SpontaneousFormDetail />);

      expect(
        screen.getByText('spontaneousForm.detail.formConfiguration')
      ).toBeInTheDocument();
    });

    it('renders general configuration section', () => {
      render(<SpontaneousFormDetail />);

      expect(
        screen.getByText('spontaneousForm.detail.generalConfiguration')
      ).toBeInTheDocument();
      expect(
        screen.getByText('spontaneousForm.detail.identificationCode')
      ).toBeInTheDocument();
      expect(
        screen.getByText('spontaneousForm.detail.structure')
      ).toBeInTheDocument();
    });

    it('renders translations section', () => {
      render(<SpontaneousFormDetail />);

      expect(
        screen.getByText('spontaneousForm.detail.translations')
      ).toBeInTheDocument();
      expect(
        screen.getByText('spontaneousForm.detail.dictionary')
      ).toBeInTheDocument();
    });

    it('renders in use section with debtPositionTypeOrgCount', () => {
      render(<SpontaneousFormDetail />);

      expect(
        screen.getByText('spontaneousForm.detail.inUse')
      ).toBeInTheDocument();
      expect(
        screen.getByText('spontaneousForm.detail.debtPositionTypeOrgCount')
      ).toBeInTheDocument();
      expect(screen.getByText('22')).toBeInTheDocument();
    });

    it('displays "Codice JSON" when structure has fields', () => {
      render(<SpontaneousFormDetail />);

      const jsonCodeElements = screen.getAllByText(
        'spontaneousForm.detail.jsonCode'
      );
      expect(jsonCodeElements.length).toBeGreaterThanOrEqual(1);
    });

    it('displays "Codice JSON" when dictionary is present', () => {
      render(<SpontaneousFormDetail />);

      const jsonCodeElements = screen.getAllByText(
        'spontaneousForm.detail.jsonCode'
      );
      expect(jsonCodeElements).toHaveLength(2);
    });

    it('renders delete button', () => {
      render(<SpontaneousFormDetail />);

      expect(screen.getByText('commons.delete')).toBeInTheDocument();
    });

    it('renders edit button', () => {
      render(<SpontaneousFormDetail />);

      expect(screen.getByText('commons.edit')).toBeInTheDocument();
    });

    it('renders delete button with error color and outlined variant', () => {
      render(<SpontaneousFormDetail />);

      const deleteButton = screen.getByText('commons.delete').closest('button');
      expect(deleteButton).toHaveClass('MuiButton-outlinedError');
    });

    it('renders edit button with primary color and contained variant', () => {
      render(<SpontaneousFormDetail />);

      const editButton = screen.getByText('commons.edit').closest('button');
      expect(editButton).toHaveClass('MuiButton-containedPrimary');
    });
  });

  describe('when structure and dictionary are empty', () => {
    beforeEach(() => {
      mockGetSpontaneousFormById.mockReturnValue({
        data: { response: mockFormDetailWithoutStructureAndDictionary },
        isLoading: false,
        isError: false
      });
    });

    it('displays "-" when structure has no fields', () => {
      render(<SpontaneousFormDetail />);

      const dashElements = screen.getAllByText('-');
      expect(dashElements.length).toBeGreaterThanOrEqual(1);
    });

    it('displays "-" when dictionary is not present', () => {
      render(<SpontaneousFormDetail />);

      const dashElements = screen.getAllByText('-');
      expect(dashElements).toHaveLength(2);
    });

    it('displays debtPositionTypeOrgCount value correctly', () => {
      render(<SpontaneousFormDetail />);

      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('when debtPositionTypeOrgCount is undefined', () => {
    beforeEach(() => {
      mockGetSpontaneousFormById.mockReturnValue({
        data: { response: mockFormDetailWithNullCount },
        isLoading: false,
        isError: false
      });
    });

    it('displays "-" when debtPositionTypeOrgCount is undefined', () => {
      render(<SpontaneousFormDetail />);

      const dashElements = screen.getAllByText('-');
      expect(dashElements.length).toBeGreaterThanOrEqual(1);
    });

    it('still displays "Codice JSON" for structure and dictionary', () => {
      render(<SpontaneousFormDetail />);

      const jsonCodeElements = screen.getAllByText(
        'spontaneousForm.detail.jsonCode'
      );
      expect(jsonCodeElements).toHaveLength(2);
    });
  });

  describe('when data is loading', () => {
    beforeEach(() => {
      mockGetSpontaneousFormById.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false
      });
    });

    it('renders nothing while loading', () => {
      const { container } = render(<SpontaneousFormDetail />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('when delete mutation is pending', () => {
    beforeEach(() => {
      mockGetSpontaneousFormById.mockReturnValue({
        data: { response: mockFormDetail },
        isLoading: false,
        isError: false
      });

      mockDeleteSpontaneousForm.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true
      });
    });

    it('disables delete button when mutation is pending', () => {
      render(<SpontaneousFormDetail />);

      const deleteButton = screen.getByText('commons.delete').closest('button');
      expect(deleteButton).toBeDisabled();
    });

    it('keeps edit button enabled when delete mutation is pending', () => {
      render(<SpontaneousFormDetail />);

      const editButton = screen.getByText('commons.edit').closest('button');
      expect(editButton).not.toBeDisabled();
    });
  });

  describe('API calls', () => {
    beforeEach(() => {
      mockGetSpontaneousFormById.mockReturnValue({
        data: { response: mockFormDetail },
        isLoading: false,
        isError: false
      });
    });

    it('calls getSpontaneousFormById with correct parameters', () => {
      render(<SpontaneousFormDetail />);

      expect(mockGetSpontaneousFormById).toHaveBeenCalledWith({
        organizationId: 123,
        spontaneousFormId: 1
      });
    });

    it('calls deleteSpontaneousForm hook with correct organizationId', () => {
      render(<SpontaneousFormDetail />);

      expect(mockDeleteSpontaneousForm).toHaveBeenCalledWith({
        organizationId: 123
      });
    });
  });

  describe('Delete functionality - Successful deletion', () => {
    beforeEach(() => {
      mockGetSpontaneousFormById.mockReturnValue({
        data: { response: mockFormDetail },
        isLoading: false,
        isError: false
      });
      mockDeleteSpontaneousForm.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false
      });
    });

    it('calls delete mutation when delete button is clicked', async () => {
      render(<SpontaneousFormDetail />);

      fireEvent.click(screen.getByTestId('delete-button'));

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(1);
      });
    });

    it('shows success notification after successful deletion', async () => {
      render(<SpontaneousFormDetail />);

      fireEvent.click(screen.getByTestId('delete-button'));

      await waitFor(() => {
        expect(mockNotify.emit).toHaveBeenCalledWith(
          'spontaneousForm.detail.deleteSuccess',
          'success'
        );
      });
    });

    it('navigates to list page after successful deletion', async () => {
      render(<SpontaneousFormDetail />);

      fireEvent.click(screen.getByTestId('delete-button'));

      await waitFor(() => {
        expect(mockGeneratePath).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(
          '/backoffice/spontaneous-form'
        );
      });
    });

    it('does not show error dialog on successful deletion', async () => {
      render(<SpontaneousFormDetail />);

      fireEvent.click(screen.getByTestId('delete-button'));

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled();
      });

      expect(screen.queryByTestId('error-dialog')).not.toBeInTheDocument();
    });
  });

  describe('Delete functionality - 409 Conflict (form in use)', () => {
    beforeEach(() => {
      mockGetSpontaneousFormById.mockReturnValue({
        data: { response: mockFormDetail },
        isLoading: false,
        isError: false
      });
      mockDeleteSpontaneousForm.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false
      });
      mockMutateAsync.mockRejectedValue(createAxiosError(409));
    });

    it('opens error dialog when backend returns 409', async () => {
      render(<SpontaneousFormDetail />);

      fireEvent.click(screen.getByTestId('delete-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-dialog')).toBeVisible();
      });
    });

    it('shows cannot delete title in error dialog', async () => {
      render(<SpontaneousFormDetail />);

      fireEvent.click(screen.getByTestId('delete-button'));

      await waitFor(() => {
        expect(
          screen.getByText('spontaneousForm.detail.cannotDeleteTitle')
        ).toBeInTheDocument();
      });
    });

    it('shows cannot delete message in error dialog', async () => {
      render(<SpontaneousFormDetail />);

      fireEvent.click(screen.getByTestId('delete-button'));

      await waitFor(() => {
        expect(
          screen.getByText('spontaneousForm.detail.cannotDeleteMessage')
        ).toBeInTheDocument();
      });
    });

    it('shows only close button in error dialog', async () => {
      render(<SpontaneousFormDetail />);

      fireEvent.click(screen.getByTestId('delete-button'));

      await waitFor(() => {
        expect(
          screen.getByTestId('error-dialog-confirm-button')
        ).toBeInTheDocument();
      });

      expect(screen.getByText('commons.close')).toBeInTheDocument();
      expect(
        screen.queryByTestId('error-dialog-cancel-button')
      ).not.toBeInTheDocument();
    });

    it('closes error dialog when close button is clicked', async () => {
      render(<SpontaneousFormDetail />);

      fireEvent.click(screen.getByTestId('delete-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-dialog')).toBeVisible();
      });

      fireEvent.click(screen.getByTestId('error-dialog-confirm-button'));

      await waitFor(() => {
        expect(screen.queryByTestId('error-dialog')).not.toBeInTheDocument();
      });
    });

    it('does not navigate when backend returns 409', async () => {
      render(<SpontaneousFormDetail />);

      fireEvent.click(screen.getByTestId('delete-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-dialog')).toBeVisible();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('does not show success notification when backend returns 409', async () => {
      render(<SpontaneousFormDetail />);

      fireEvent.click(screen.getByTestId('delete-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-dialog')).toBeVisible();
      });

      expect(mockNotify.emit).not.toHaveBeenCalledWith(
        'spontaneousForm.detail.deleteSuccess',
        'success'
      );
    });

    it('does not show generic error notification when backend returns 409', async () => {
      render(<SpontaneousFormDetail />);

      fireEvent.click(screen.getByTestId('delete-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-dialog')).toBeVisible();
      });

      expect(mockNotify.emit).not.toHaveBeenCalledWith(
        'spontaneousForm.detail.deleteError',
        'error'
      );
    });
  });

  describe('Delete functionality - Other errors (non-409)', () => {
    beforeEach(() => {
      mockGetSpontaneousFormById.mockReturnValue({
        data: { response: mockFormDetail },
        isLoading: false,
        isError: false
      });
      mockDeleteSpontaneousForm.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false
      });
    });

    it('shows error notification when backend returns 500', async () => {
      mockMutateAsync.mockRejectedValue(createAxiosError(500));

      render(<SpontaneousFormDetail />);

      fireEvent.click(screen.getByTestId('delete-button'));

      await waitFor(() => {
        expect(mockNotify.emit).toHaveBeenCalledWith(
          'spontaneousForm.detail.deleteError',
          'error'
        );
      });
    });

    it('does not open error dialog when backend returns 500', async () => {
      mockMutateAsync.mockRejectedValue(createAxiosError(500));

      render(<SpontaneousFormDetail />);

      fireEvent.click(screen.getByTestId('delete-button'));

      await waitFor(() => {
        expect(mockNotify.emit).toHaveBeenCalledWith(
          'spontaneousForm.detail.deleteError',
          'error'
        );
      });

      expect(screen.queryByTestId('error-dialog')).not.toBeInTheDocument();
    });

    it('shows error notification when network error occurs', async () => {
      mockMutateAsync.mockRejectedValue(new Error('Network error'));

      render(<SpontaneousFormDetail />);

      fireEvent.click(screen.getByTestId('delete-button'));

      await waitFor(() => {
        expect(mockNotify.emit).toHaveBeenCalledWith(
          'spontaneousForm.detail.deleteError',
          'error'
        );
      });
    });

    it('does not navigate when deletion fails with non-409 error', async () => {
      mockMutateAsync.mockRejectedValue(createAxiosError(500));

      render(<SpontaneousFormDetail />);

      fireEvent.click(screen.getByTestId('delete-button'));

      await waitFor(() => {
        expect(mockNotify.emit).toHaveBeenCalled();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
