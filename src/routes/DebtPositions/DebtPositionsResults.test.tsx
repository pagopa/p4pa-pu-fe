import userEvent from '@testing-library/user-event';
import { DebtPositionResults, SearchType } from './DebtPositionsResults';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { render } from '../../__tests__/renderers';

const mockTranslations = {
  'DebtPositions.Results.titleIUV': 'Risultati Ricerca IUV',
  'DebtPositions.Results.title': 'Risultati Posizioni Debitorie',
  'commons.createNewOne': 'Crea Nuovo IUV',
  'commons.createNew': 'Crea Nuovo',
  'commons.searchIUV': 'Cerca IUV',
  'commons.searchCF': 'Cerca Codice Fiscale',
  'commons.duetype': 'Tipo Dovuto',
  'commons.state': 'Stato',
  'commons.filters.filterResults': 'Filtra',
  'DebtPositions.Results.filters.from': 'Da',
  'dates.to': 'A'
};

describe('DebtPositionsResults', () => {
  beforeEach(() => {
    i18nTestSetup(mockTranslations);
  });

  describe('IUV Search Type', () => {
    it('renders correct title for IUV search', () => {
      render(
        <DebtPositionResults
          searchType={SearchType.IUV}
          dataGridComponent={<div data-testid="mock-grid" />}
        />
      );
      expect(screen.getByText('Risultati Ricerca IUV')).toBeInTheDocument();
    });

    it('renders IUV specific filters', () => {
      render(
        <DebtPositionResults
          searchType={SearchType.IUV}
          dataGridComponent={<div data-testid="mock-grid" />}
        />
      );
      expect(screen.getByLabelText('Cerca IUV')).toBeInTheDocument();
      expect(screen.getByLabelText('Cerca Codice Fiscale')).toBeInTheDocument();

      expect(screen.getByLabelText('Da')).toBeInTheDocument();
      expect(screen.getByLabelText('A')).toBeInTheDocument();
    });

    it('renders the correct data grid component', () => {
      render(
        <DebtPositionResults
          searchType={SearchType.IUV}
          dataGridComponent={<div data-testid="mock-grid" />}
        />
      );
      expect(screen.getByTestId('mock-grid')).toBeInTheDocument();
    });
  });

  describe('DEBT_POSITION Search Type', () => {
    it('renders correct title for debt position search', () => {
      render(
        <DebtPositionResults
          searchType={SearchType.DEBT_POSITION}
          dataGridComponent={<div data-testid="mock-grid" />}
        />
      );
      expect(screen.getByText('Risultati Posizioni Debitorie')).toBeInTheDocument();
    });

    it('renders debt position specific filters', () => {
      render(
        <DebtPositionResults
          searchType={SearchType.DEBT_POSITION}
          dataGridComponent={<div data-testid="mock-grid" />}
        />
      );
      expect(screen.queryByLabelText('Cerca IUV')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Cerca Codice Fiscale')).toBeInTheDocument();

      expect(screen.getByLabelText('Da')).toBeInTheDocument();
      expect(screen.getByLabelText('A')).toBeInTheDocument();
    });

    it('renders the correct data grid component', () => {
      render(
        <DebtPositionResults
          searchType={SearchType.DEBT_POSITION}
          dataGridComponent={<div data-testid="mock-grid" />}
        />
      );
      expect(screen.getByTestId('mock-grid')).toBeInTheDocument();
    });
  });

  describe('Navigation State Handling', () => {
    it('uses search type from location state when provided', () => {

      render(
    
        <DebtPositionResults
          searchType={SearchType.IUV}
          dataGridComponent={<div data-testid="mock-grid" />}
        />
      );
      
      expect(screen.getByText('Risultati Ricerca IUV')).toBeInTheDocument();
      expect(screen.getByLabelText('Cerca IUV')).toBeInTheDocument();
    });

    it('uses default search type when no location state provided', () => {
      render(
        <DebtPositionResults
          searchType={SearchType.DEBT_POSITION}
          dataGridComponent={<div data-testid="mock-grid" />}
        />
      );
      
      expect(screen.getByText('Risultati Posizioni Debitorie')).toBeInTheDocument();
    });
  });

  describe('Common Functionality', () => {
    it('renders call to action button', () => {
      render(
        <DebtPositionResults
          searchType={SearchType.DEBT_POSITION}
          dataGridComponent={<div data-testid="mock-grid" />}
        />
      );
      
      expect(screen.getByRole('button', { name: /crea nuovo/i })).toBeInTheDocument();
    });

    it('triggers create button click', async () => {
      const user = userEvent.setup();

      const consoleSpy = vi.spyOn(console, 'log');
      
      render(
        <DebtPositionResults
          searchType={SearchType.DEBT_POSITION}
          dataGridComponent={<div data-testid="mock-grid" />}
        />
      );
      
      const createButton = screen.getByRole('button', { name: /crea nuovo/i });
      await user.click(createButton);
      
      expect(consoleSpy).toHaveBeenCalledWith('create button clicked');
      consoleSpy.mockRestore();
    });

    it('renders common select filters', () => {
      render(
        <DebtPositionResults
          searchType={SearchType.DEBT_POSITION}
          dataGridComponent={<div data-testid="mock-grid" />}
        />
      );

      expect(screen.getByLabelText('Tipo Dovuto')).toBeInTheDocument();
      expect(screen.getByLabelText('Stato')).toBeInTheDocument();
    });

    it('renders results table container', () => {
      render(
        <DebtPositionResults
          searchType={SearchType.DEBT_POSITION}
          dataGridComponent={<div data-testid="mock-grid" />}
        />
      );
      
      expect(screen.getByLabelText('results-table')).toBeInTheDocument();
    });
    
    it('renders the correct options for due type select', async () => {
      render(
        <DebtPositionResults
          searchType={SearchType.DEBT_POSITION}
          dataGridComponent={<div data-testid="mock-grid" />}
        />
      );
      const user = userEvent.setup();
  
      const dueTypeSelect = screen.getByLabelText('Tipo Dovuto');
      await user.click(dueTypeSelect);
  
      expect(screen.getByText('TARI')).toBeInTheDocument();
      expect(screen.getByText('DOVUTO')).toBeInTheDocument();
    });

    it('allows selecting date range values', async () => {
      const user = userEvent.setup();
  
      render(
        <DebtPositionResults
          searchType={SearchType.DEBT_POSITION}
          dataGridComponent={<div data-testid="mock-grid" />}
        />
      );
  
      const fromDateInput = screen.getByLabelText('Da');
      await user.type(fromDateInput, '01/01/2025');
  
      const toDateInput = screen.getByLabelText('A');
      await user.type(toDateInput, '31/01/2025');
  
      expect(fromDateInput).toHaveValue('01/01/2025');
      expect(toDateInput).toHaveValue('31/01/2025');
    });

    it('shows Add icon for DEBT_POSITION search type', () => {
      render(
        <DebtPositionResults
          searchType={SearchType.DEBT_POSITION}
          dataGridComponent={<div data-testid="mock-grid" />}
        />
      );
  
      const addIcon = document.querySelector('svg.MuiSvgIcon-root');
      expect(addIcon).toBeInTheDocument();
    });

    it('renders complex dataGridComponent correctly', () => {
      render(
        <DebtPositionResults
          searchType={SearchType.DEBT_POSITION}
          dataGridComponent={
            <div data-testid="complex-grid">
              <span>Complex Grid Component</span>
              <button>Grid Action</button>
            </div>
          }
        />
      );
  
      expect(screen.getByTestId('complex-grid')).toBeInTheDocument();
      expect(screen.getByText('Complex Grid Component')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Grid Action' })).toBeInTheDocument();
    });
  });
});
