import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../__tests__/renderers';
import userEvent from '@testing-library/user-event';
import { noFilterSetted } from '../../../utils/filtersValidation';
import { Reporting } from '.';
import { PageRoutes } from '../..';
import { generatePath } from 'react-router';

const mockNavigate = vi.fn();
vi.mock('../../../hooks/useAppNavigation', () => ({
  useAppNavigate: () => mockNavigate
}));

vi.mock(import('../../../utils/filtersValidation'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    noFilterSetted: vi.fn()
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Reporting', () => {
  it('renders title, description, and both cards', () => {
    render(<Reporting />);
    expect(screen.getByText('reporting.title')).toBeInTheDocument();
    expect(screen.getByText('reporting.description')).toBeInTheDocument();
    expect(
      screen.getByText('reporting.searchTitleContainer')
    ).toBeInTheDocument();
    expect(
      screen.getByText('reporting.searchDescriptionContainer')
    ).toBeInTheDocument();
    expect(
      screen.getByText('reporting.importFlowsTitleContainer')
    ).toBeInTheDocument();
    expect(
      screen.getByText('reporting.importFlowsDescriptionContainer')
    ).toBeInTheDocument();
    expect(screen.getByText('commons.importFlow')).toBeInTheDocument();
    expect(screen.getByText('commons.showAllFlows')).toBeInTheDocument();
  });

  it('does not navigate and shows error if no filter is set', async () => {
    vi.mocked(noFilterSetted).mockReturnValue(true);
    render(<Reporting />);
    await userEvent.click(screen.getByText('commons.filters.filterResults'));
    expect(mockNavigate).not.toHaveBeenCalled();
    // Error message is now shown via ErrorMessage component
    expect(
      await screen.findByText('commons.filters.filterError')
    ).toBeInTheDocument();
  });

  it('navigates with hash when filters are set', async () => {
    vi.mocked(noFilterSetted).mockReturnValue(false);
    render(<Reporting />);

    // Fill in at least one field to satisfy validation
    const iuvInput = screen.getByLabelText('commons.searchIUV');
    await userEvent.type(iuvInput, '123456');

    await userEvent.click(screen.getByText('commons.filters.filterResults'));
    expect(mockNavigate).toHaveBeenCalledWith(
      PageRoutes.REPORTING_SEARCH_RESULTS,
      expect.objectContaining({ hashObject: expect.any(Object) })
    );
  });

  it('triggers reset on reset button click', async () => {
    render(<Reporting />);
    await userEvent.click(screen.getByText('commons.filters.remove'));
  });

  it('navigates to import flows on action click', async () => {
    render(<Reporting />);
    await userEvent.click(screen.getByText('commons.importFlow'));
    expect(mockNavigate).toHaveBeenCalledWith(
      generatePath(PageRoutes.IMPORT_FLOWS, {
        category: 'reporting'
      })
    );
  });

  it('navigates to import overview on link click', async () => {
    render(<Reporting />);
    await userEvent.click(screen.getByText('commons.showAllFlows'));
    expect(mockNavigate).toHaveBeenCalledWith(
      PageRoutes.REPORTING_IMPORT_OVERVIEW
    );
  });
});
