import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '../../__tests__/renderers';
import { Assessment } from './Assessment';
import { useNavigate } from 'react-router';

import {
  filterValues,
  selectedFilters,
  noFilterIsSelected,
  initialFilterValues
} from '../../store/FilterStore';

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

describe('Assessment', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    filterValues.value = { ...initialFilterValues };
    selectedFilters.value = [];
    // control peek to check selected filters in your hook
    noFilterIsSelected.peek = () => selectedFilters.value.length === 0;
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
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

  it('should navigate on valid filters', async () => {
    selectedFilters.value = ['ASSESSMENT_NAME'];
    filterValues.value.ASSESSMENT_NAME = 'test';

    const peekSpy = vi.spyOn(noFilterIsSelected, 'peek').mockReturnValue(false);

    render(<Assessment />);
    fireEvent.click(screen.getByRole('button', { name: 'commons.search' }));

    await waitFor(() => {
      expect(
        screen.queryByTestId('multifilters-error-text')
      ).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith(
        '/piattaformaunitaria/assessment/search-results#ASSESSMENT_NAME=test'
      );
    });

    peekSpy.mockRestore();
  });

  it('should show error on invalid filters', () => {
    selectedFilters.value = [];
    filterValues.value.ASSESSMENT_NAME = '';
    render(<Assessment />);
    fireEvent.click(screen.getByRole('button', { name: 'commons.search' }));

    expect(screen.getByTestId('multifilters-error-text')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should remove filters when remove button clicked', () => {
    selectedFilters.value = ['ASSESSMENT_NAME'];
    render(<Assessment />);
    fireEvent.click(
      screen.getByRole('button', { name: 'commons.filters.remove' })
    );
    expect(selectedFilters.value.length).toBe(0);
  });

  it('should hide error on remove filters button after showing error', async () => {
    selectedFilters.value = [];
    render(<Assessment />);
    fireEvent.click(screen.getByRole('button', { name: 'commons.search' }));
    const alert = await screen.findByTestId('multifilters-error-text');
    expect(alert).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'commons.filters.remove' })
    );

    expect(
      screen.queryByTestId('multifilters-error-text')
    ).not.toBeInTheDocument();
  });

  it('should trigger create assessment button click', () => {
    render(<Assessment />);
    const btn = screen.getByText('assessment.createAssessment');
    fireEvent.click(btn);
    expect(btn).toBeInTheDocument();
  });

  it('should trigger create chapter button click', () => {
    render(<Assessment />);
    const btn = screen.getByText('assessment.createChapter');
    fireEvent.click(btn);
    expect(btn).toBeInTheDocument();
  });

  it('should trigger view all chapters click', () => {
    render(<Assessment />);
    const btn = screen.getByText('assessment.seeAllChapters');
    fireEvent.click(btn);
    expect(btn).toBeInTheDocument();
  });
});
