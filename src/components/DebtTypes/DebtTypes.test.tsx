import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import DebtTypes from './DebtTypes';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

describe('DebtTypes Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('disable search button when input contains less than 3 characters', () => {
    render(<DebtTypes />);

    const searchInput = screen.getByLabelText('debtTypes.searchDescription');
    const searchButton = screen.getByText('commons.search');

    expect(searchButton).toBeDisabled();

    fireEvent.change(searchInput, { target: { value: 'ab' } });
    expect(searchButton).toBeDisabled();

    fireEvent.change(searchInput, { target: { value: 'abc' } });
    expect(searchButton).not.toBeDisabled();
  });

  it('filters data grid during search and restores it when search field is cleared', () => {
    render(<DebtTypes />);

    const searchInput = screen.getByLabelText('debtTypes.searchDescription');
    const searchButton = screen.getByText('commons.search');
    
    //first row for header
    expect(screen.getAllByRole('row').length).toBe(4);

    fireEvent.change(searchInput, { target: { value: 'cosap' } });
    fireEvent.click(searchButton);

    expect(screen.getAllByRole('row').length).toBe(2);
    expect(screen.getByText('Cosap/Tosap')).toBeDefined();
    
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.click(searchButton);

    expect(screen.getAllByRole('row').length).toBe(1);
    expect(screen.getByText('flowDataGrid.noDataRows')).toBeDefined();

    fireEvent.change(searchInput, { target: { value: '' } });

    expect(screen.getAllByRole('row').length).toBe(4);
  });
});
