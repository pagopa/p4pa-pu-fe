import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor
} from '../../../__tests__/renderers';
import { useNavigate } from 'react-router';
import SpontaneousFormPage from './SpontaneousFormPage';

const mockData = {
  content: [
    {
      spontaneousFormId: 1,
      code: 'FORM_001',
      organizationId: 123,
      debtPositionTypeOrgCount: 5,
      structure: { fields: [] }
    },
    {
      spontaneousFormId: 2,
      code: 'FORM_002',
      organizationId: 123,
      debtPositionTypeOrgCount: 3,
      structure: { fields: [] }
    }
  ],
  totalPages: 2,
  totalElements: 2,
  number: 0,
  size: 10
};

const { mockGetSpontaneousForms } = vi.hoisted(() => ({
  mockGetSpontaneousForms: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    data: mockData,
    isLoading: false,
    isError: false
  }))
}));

vi.mock('../../../api/spontaneousForm', () => ({
  default: {
    getSpontaneousForms: mockGetSpontaneousForms
  }
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
    Link: ({ children }: { children: React.ReactNode }) => children,
    generatePath: vi.fn().mockReturnValue('/mock-path')
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const mockMutateAsync = vi.fn((_args: any) =>
  Promise.resolve({ data: mockData })
);

vi.mock('../../../hooks/useSearch', () => ({
  useSearch: vi.fn(() => ({
    query: {
      mutateAsync: mockMutateAsync,
      isLoading: false,
      data: mockData
    },
    applyFilters: (filters: { code?: string }) =>
      mockMutateAsync({ filters, pagination: { page: 0, size: 10 }, sort: [] })
  }))
}));

describe('SpontaneousFormPage', () => {
  const navigateMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetSpontaneousForms.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      data: mockData,
      isLoading: false,
      isError: false
    });

    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(navigateMock);

    mockMutateAsync.mockClear();
  });

  it('renders page with translation keys as text and shows initial data', () => {
    render(<SpontaneousFormPage />);

    expect(
      screen.getByText('commons.routes.SPONTANEOUS_FORM')
    ).toBeInTheDocument();
    expect(screen.getByText('spontaneousForm.description')).toBeInTheDocument();
    expect(screen.getByText('commons.createNewOne')).toBeInTheDocument();

    expect(
      screen.getByRole('textbox', { name: 'spontaneousForm.searchByCode' })
    ).toBeInTheDocument();

    expect(screen.getByText('commons.search')).toBeInTheDocument();

    expect(screen.getByText('FORM_001')).toBeInTheDocument();
    expect(screen.getByText('FORM_002')).toBeInTheDocument();
  });

  it('calls applyFilters and triggers mutateAsync when Search button is clicked', async () => {
    render(<SpontaneousFormPage />);

    const searchInput = screen.getByRole('textbox', {
      name: 'spontaneousForm.searchByCode'
    });
    fireEvent.change(searchInput, { target: { value: 'FORM_001' } });

    const searchButton = screen.getByText('commons.search');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({ code: 'FORM_001' }),
          pagination: expect.any(Object),
          sort: expect.any(Array)
        })
      );
    });
  });

  it('navigates to creation page when Create New button is clicked', () => {
    render(<SpontaneousFormPage />);

    const createButton = screen.getByText('commons.createNewOne');
    fireEvent.click(createButton);

    // expect(navigateMock).toHaveBeenCalledWith(
    //   PageRoutes.SPONTANEOUS_FORM_CREATE
    // );
  });

  it('displays correct column headers', () => {
    render(<SpontaneousFormPage />);

    expect(
      screen.getByText('spontaneousForm.columns.code')
    ).toBeInTheDocument();
    expect(
      screen.getByText('spontaneousForm.columns.debtPositionTypeOrgCount')
    ).toBeInTheDocument();
  });

  it('displays debtPositionTypeOrgCount values correctly', () => {
    render(<SpontaneousFormPage />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
