import { render } from '../../__tests__/renderers';
import { screen } from '@testing-library/react';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import { DebtTypeCatalogDetailView } from './DebtTypeCatalogDetailView';
import { useLocation } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: vi.fn()
  };
});

describe('DebtTypeCatalogDetailView', () => {
  beforeEach(() => {
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { debtTypeName: 'Test Type Name' }
    });
  });

  it('renders title and description', () => {
    render(<DebtTypeCatalogDetailView />);
    expect(screen.getByText('Test Type Name')).toBeInTheDocument();
    expect(
      screen.getByText('debtTypeCatalogDetail.description')
    ).toBeInTheDocument();
  });

  it('renders delete and edit buttons', () => {
    render(<DebtTypeCatalogDetailView />);
    expect(
      screen.getAllByRole('button', { name: 'commons.delete' }).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByRole('button', { name: 'commons.edit' }).length
    ).toBeGreaterThanOrEqual(1);
  });

  it('renders accordion with configuration title', () => {
    render(<DebtTypeCatalogDetailView />);
    expect(
      screen.getByText('debtTypeCatalogDetail.debtCatalogConfiguration.title')
    ).toBeInTheDocument();
  });
});
