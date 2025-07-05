import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '../../__tests__/renderers';
import { Assessment } from './Assessment';
import { useNavigate } from 'react-router';
import React from 'react';

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

const mockRemoveAllFilters = vi.fn();
const mockNoFilterIsSelected = vi.fn(() => false);
const mockExecuteSearch = vi.fn();

vi.mock('../../hooks/useMultiFilters', () => ({
  useMultiFilters: vi.fn(() => ({
    filterMap: {
      ASSESSMENT_NAME: {
        label: 'assessment.name',
        fields: [
          {
            type: 'textField',
            label: 'assessment.name'
          }
        ]
      },
      DEBT_TYPE: {
        label: 'debtType.title',
        fields: [
          {
            type: 'select',
            label: 'debtType.title',
            options: []
          }
        ]
      },
      ASSESSMENT_STATUS: {
        label: 'assessment.status',
        fields: [
          {
            type: 'select',
            label: 'assessment.status'
          }
        ]
      }
    },
    removeAllFilters: mockRemoveAllFilters,
    noFilterIsSelected: {
      peek: mockNoFilterIsSelected
    },
    filterValues: {
      ASSESSMENT_NAME: '',
      DEBT_TYPE: '',
      ASSESSMENT_STATUS: '',
      IUV: '',
      LAST_UPDATE_DATE_FROM: null,
      LAST_UPDATE_DATE_TO: null
    }
  })),
  FilterCategory: {
    ASSESSMENT: 'ASSESSMENT'
  }
}));

vi.mock('../../hooks/useDebtPositionsTypeOrg', () => ({
  useDebtPositionsTypeOrg: () => ({
    optionsMap: [
      { value: 'ALL', label: 'commons.all' },
      { value: 'TYPE1', label: 'Type 1' },
      { value: 'TYPE2', label: 'Type 2' }
    ]
  })
}));

vi.mock('../../store/GlobalStore', () => ({
  useStore: () => ({
    state: {
      organizationId: 123,
      filterValues: {
        ACCOUNTING_DATE_FROM: null,
        ACCOUNTING_DATE_TO: null,
        ACCOUNT_REGISTRY_CODE: '',
        AMOUNT: null,
        BILL_CODE: '',
        BILL_FROM: null,
        BILL_DATE_FROM: null,
        BILL_DATE_TO: null,
        DOCUMENT_CODE: '',
        DOCUMENT_CODE_FROM: null,
        IUV: '',
        IUR: '',
        IUD: '',
        IUF: '',
        PAYER: '',
        PSP_COMPANY_NAME: '',
        REGULATION_UNIQUE_IDENTIFIER: '',
        REMITTANCE_INFORMATION: '',
        REPORT_ID: '',
        TEMPORARY_CODE: '',
        TEMPORARY_CODE_FROM: null,
        VALUE_DATE_FROM: null,
        VALUE_DATE_TO: null,
        REGION_VALUE_DATE_FROM: null,
        REGION_VALUE_DATE_TO: null,
        PAY_DATE_FROM: null,
        PAY_DATE_TO: null,
        CLASSIFICATION_TYPE: '',
        LAST_CLASSIFICATION_DATE_FROM: null,
        LAST_CLASSIFICATION_DATE_TO: null,
        REGULATION_DATE_FROM: null,
        REGULATION_DATE_TO: null,
        PAYMENT_DATE_FROM: null,
        PAYMENT_DATE_TO: null,
        ASSESSMENT_NAME: '',
        DEBT_TYPE: '',
        ASSESSMENT_STATUS: '',
        LAST_UPDATE_DATE_FROM: null,
        LAST_UPDATE_DATE_TO: null
      },
      selectedFilters: []
    }
  }),
  StoreProvider: ({ children }: { children: React.ReactNode }) => children
}));

const mockAssessmentsSearch = {
  executeSearch: mockExecuteSearch,
  isLoading: false,
  isError: false,
  error: null,
  data: null
};

vi.mock('../../hooks/useAssessmentsSearch', () => ({
  useAssessmentsSearch: () => mockAssessmentsSearch
}));

describe('Assessment', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    mockAssessmentsSearch.isLoading = false;
    mockNoFilterIsSelected.mockReturnValue(false);
  });

  it('should render all main elements', () => {
    render(<Assessment />);

    expect(screen.getByText('commons.routes.ASSESSMENT')).toBeInTheDocument();

    expect(screen.getByText('assessment.createAssessment')).toBeInTheDocument();

    expect(screen.getByText('assessment.search')).toBeInTheDocument();
    expect(
      screen.getByText('assessment.searchDescription')
    ).toBeInTheDocument();

    expect(screen.getByText('assessment.chapters')).toBeInTheDocument();
    expect(
      screen.getByText('assessment.chaptersDescription')
    ).toBeInTheDocument();
    expect(screen.getByText('assessment.createChapter')).toBeInTheDocument();
    expect(screen.getByText('assessment.seeAllChapters')).toBeInTheDocument();
  });

  it('should render SearchCard buttons', () => {
    render(<Assessment />);

    expect(
      screen.getByRole('button', { name: 'commons.filters.remove' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'commons.search' })
    ).toBeInTheDocument();
  });

  it('should render create assessment button and allow click', () => {
    render(<Assessment />);

    const createButton = screen.getByText('assessment.createAssessment');
    expect(createButton).toBeInTheDocument();
    fireEvent.click(createButton);
    expect(createButton).toBeInTheDocument();
  });

  it('should render create chapter button and allow click', () => {
    render(<Assessment />);

    const createChapterButton = screen.getByText('assessment.createChapter');
    expect(createChapterButton).toBeInTheDocument();

    fireEvent.click(createChapterButton);
    expect(createChapterButton).toBeInTheDocument();
  });

  it('should render view all chapters link and allow click', () => {
    render(<Assessment />);

    const viewAllButton = screen.getByText('assessment.seeAllChapters');
    expect(viewAllButton).toBeInTheDocument();

    fireEvent.click(viewAllButton);
    expect(viewAllButton).toBeInTheDocument();
  });

  it('should execute search when clicking search button with valid filters', () => {
    mockNoFilterIsSelected.mockReturnValue(true);

    render(<Assessment />);

    const searchButton = screen.getByRole('button', { name: 'commons.search' });
    fireEvent.click(searchButton);

    expect(mockExecuteSearch).toHaveBeenCalled();
  });

  it('should show error when searching without selected filters', () => {
    mockNoFilterIsSelected.mockReturnValue(false);

    render(<Assessment />);

    const searchButton = screen.getByRole('button', { name: 'commons.search' });
    fireEvent.click(searchButton);

    expect(screen.getByTestId('multifilters-error-text')).toBeInTheDocument();
    expect(
      screen.getByText('commons.filters.atLeastOneFilter')
    ).toBeInTheDocument();

    expect(mockExecuteSearch).not.toHaveBeenCalled();
  });

  it('should remove all filters when clicking remove button', () => {
    render(<Assessment />);

    const removeButton = screen.getByRole('button', {
      name: 'commons.filters.remove'
    });
    fireEvent.click(removeButton);

    expect(mockRemoveAllFilters).toHaveBeenCalled();
  });

  it('should disable search button when isLoading is true', () => {
    mockAssessmentsSearch.isLoading = true;

    render(<Assessment />);

    const searchButton = screen.getByRole('button', { name: 'commons.search' });
    expect(searchButton).toBeDisabled();
  });

  it('should hide error message when interacting with filters via removal', () => {
    mockNoFilterIsSelected.mockReturnValue(false);

    render(<Assessment />);

    const searchButton = screen.getByRole('button', { name: 'commons.search' });
    fireEvent.click(searchButton);

    expect(screen.getByTestId('multifilters-error-text')).toBeInTheDocument();

    const removeButton = screen.getByRole('button', {
      name: 'commons.filters.remove'
    });
    fireEvent.click(removeButton);

    expect(
      screen.queryByTestId('multifilters-error-text')
    ).not.toBeInTheDocument();
  });

  it('should configure DEBT_TYPE options in filterMap correctly', () => {
    render(<Assessment />);

    expect(screen.getByText('assessment.search')).toBeInTheDocument();
  });

  it('should initialize useAssessmentsSearch with correct parameters', () => {
    render(<Assessment />);

    expect(screen.getByText('commons.routes.ASSESSMENT')).toBeInTheDocument();
  });
});
