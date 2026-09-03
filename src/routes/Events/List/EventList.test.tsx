/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventList } from './index';
import type {
  PagedSilRegistry,
  PagedPagoPaRegistry,
  RegistryOutcome,
  RegistrySilEventType,
  RegistryPagoPaEventType
} from '../../../../generated/core/data-contracts';

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();

  return {
    ...actual,
    useNavigate: vi.fn(),
    useParams: vi.fn()
  };
});

vi.mock('../../../store/GlobalStore', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../../store/GlobalStore')>();

  return {
    ...actual,
    useStore: vi.fn()
  };
});

vi.mock('../../../api/getPagoPaRegistries', () => ({
  default: vi.fn()
}));

vi.mock('../../../api/getSilRegistries', () => ({
  default: vi.fn()
}));

vi.mock('../../../hooks/useSearch', () => ({
  useSearch: vi.fn()
}));

vi.mock('../../../utils/filtersValidation', () => ({
  noFilterSetted: vi.fn(),
  shouldShowGeneralError: vi.fn(),
  hasPartialDateRangeErrors: vi.fn(),
  canPerformSearch: vi.fn(),
  default: {
    noFilterSetted: vi.fn(),
    shouldShowGeneralError: vi.fn(),
    hasPartialDateRangeErrors: vi.fn(),
    canPerformSearch: vi.fn()
  }
}));

import { useNavigate, useParams } from 'react-router';
import { useStore } from '../../../store/GlobalStore';
import getPagoPaRegistries from '../../../api/getPagoPaRegistries';
import getSilRegistries from '../../../api/getSilRegistries';
import { useSearch } from '../../../hooks/useSearch';
import {
  noFilterSetted,
  shouldShowGeneralError
} from '../../../utils/filtersValidation';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import { render } from '../../../__tests__/renderers';

describe('EventList', () => {
  const mockNavigate = vi.fn();
  const mockOrganizationId = 12345;

  const mockSilRegistryData: PagedSilRegistry = {
    content: [
      {
        registryId: 'sil-001',
        registryOrigin: 'SIL',
        dateTime: '2025-10-30T10:00:00Z',
        traceId: 'trace-001',
        brokerFiscalCode: '12345678901',
        orgFiscalCode: '98765432109',
        iuv: '123456789012345678',
        nav: 'NAV001',
        eventType: 'PAID_NOTIFICATION_OUTCOME' as RegistrySilEventType,
        eventSubType: 'REQ' as any,
        requestorId: 'requestor-001',
        grantorId: 'grantor-001',
        outcome: 'OK' as RegistryOutcome
      },
      {
        registryId: 'sil-002',
        registryOrigin: 'SIL',
        dateTime: '2025-10-30T12:00:00Z',
        traceId: 'trace-003',
        brokerFiscalCode: '12345678901',
        orgFiscalCode: '98765432109',
        iuv: '987654321098765432',
        eventType: 'ACTUALIZATION' as RegistrySilEventType,
        eventSubType: 'RESP' as any,
        requestorId: 'requestor-003',
        grantorId: 'grantor-003',
        outcome: 'KO' as RegistryOutcome
      }
    ],
    size: 20,
    totalElements: 2,
    totalPages: 1,
    number: 0
  };

  const mockPagoPaRegistryData: PagedPagoPaRegistry = {
    content: [
      {
        registryId: 'pagopa-001',
        registryOrigin: 'PAGOPA',
        dateTime: '2025-10-30T11:00:00Z',
        traceId: 'trace-002',
        brokerStationId: 'station-001',
        orgFiscalCode: '98765432109',
        iuv: '223456789012345678',
        nav: 'NAV002',
        ccp: 'CCP002',
        pspId: 'PSP001',
        pspChannelId: 'CHANNEL001',
        paymentMethod: 'CARD',
        eventCategory: 'INTERFACCIA' as any,
        eventType: 'PaForNode_paVerifyPaymentNotice' as RegistryPagoPaEventType,
        eventSubType: 'REQ' as any,
        requestorId: 'requestor-002',
        grantorId: 'grantor-002',
        outcome: 'OK' as RegistryOutcome
      }
    ],
    size: 20,
    totalElements: 1,
    totalPages: 1,
    number: 0
  };

  const mockApplyFilters = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    i18nTestSetup({
      'events.list.title': 'Lista Eventi',
      'events.list.accessibleTitleSil': 'Lista Eventi SIL',
      'events.list.accessibleTitlePagoPa': 'Lista Eventi PagoPa',
      'events.list.noResults.title': 'Nessun risultato trovato',
      'events.list.noResults.description': 'Prova ad aggiustare i tuoi filtri',
      'events.list.date': 'Data',
      'events.list.outcome': 'Esito',
      'events.list.iuv': 'IUV',
      'events.list.event': 'Evento',
      'events.list.subEvent': 'Sotto-evento',
      'events.searchIUVDescription': 'Cerca per IUV',
      'events.searchDateFromDescription': 'Data Da',
      'events.searchDateToDescription': 'Data A',
      'events.searchEventDescription': 'Tipo Evento',
      'events.searchEventOutcome': 'Esito',
      'commons.search': 'Cerca',
      'common.errors.general': 'Si è verificato un errore',
      'commons.filters.atLeastOneFilter':
        'Inserisci almeno un filtro per la ricerca',
      'enums.registryOutcome.OK': 'OK',
      'enums.registryOutcome.KO': 'KO',
      'enums.registrySilEventType.PTDP_paaSILAutorizzaImportFlusso':
        'Autorizza Import Flusso',
      'enums.registrySilEventType.PTDP_paaSILImportaDovuto': 'Importa Dovuto',
      'enums.registrySilEventType.PTDP_paaSILInviaDovuti': 'Invia Dovuti',
      'enums.registrySilEventType.PTDP_paaSILInviaCarrelloDovuti':
        'Invia Carrello Dovuti',
      'enums.registrySilEventType.PTDP_paaSILVerificaAvviso': 'Verifica Avviso',
      'enums.registrySilEventType.PTPR_pivotSILAutorizzaImportFlussoTesoreria':
        'Autorizza Import Flusso Tesoreria',
      'enums.registrySilEventType.PTPR_pivotSILAutorizzaImportFlusso':
        'Autorizza Import Flusso',
      'enums.registrySilEventType.SIL_attualizzazioneImporti':
        'Attualizzazione Importi',
      'enums.registrySilEventType.SIL_notificaPagamento': 'Notifica Pagamento',
      'enums.registryPagoPaEventType.PaForNode_paVerifyPaymentNotice':
        'Verifica Avviso Pagamento',
      'enums.registryPagoPaEventType.PaForNode_paGetPaymentV2':
        'Ottieni Pagamento V2',
      'enums.registryPagoPaEventType.PaForNode_paSendRTV2': 'Invia RT V2',
      'enums.registryPagoPaEventType.ACA_newDebtPosition':
        'Nuova Posizione Debitoria',
      'enums.registryPagoPaEventType.GPD_createPosition': 'Crea Posizione',
      'enums.registryPagoPaEventType.GPD_updatePosition': 'Aggiorna Posizione',
      'enums.registryPagoPaEventType.GPD_deletePosition': 'Elimina Posizione',
      'enums.registryPagoPaEventType.NodeForPa_fetchPaymentReporting':
        'Recupera Reporting Pagamenti'
    });

    (useNavigate as any).mockReturnValue(mockNavigate);
    (useStore as any).mockReturnValue({
      state: {
        organizationId: mockOrganizationId
      }
    });

    (getSilRegistries as any).mockReturnValue(vi.fn());
    (getPagoPaRegistries as any).mockReturnValue(vi.fn());
  });

  describe('Initial Rendering', () => {
    it('should render the component with correct title for SIL', () => {
      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: undefined,
          isPending: false
        }
      });

      render(<EventList />);

      expect(screen.getByText('Lista Eventi')).toBeInTheDocument();
    });

    it('should render the component with correct title for PagoPa', () => {
      (useParams as any).mockReturnValue({ registryType: 'pagopa' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: undefined,
          isPending: false
        }
      });

      render(<EventList />);

      expect(screen.getByText('Lista Eventi')).toBeInTheDocument();
    });

    it('should display empty data message when no data is present', () => {
      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: undefined,
          isPending: false
        }
      });

      render(<EventList />);

      expect(screen.getByText('Nessun risultato trovato')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should display SIL registry data correctly', async () => {
      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: mockSilRegistryData,
          isPending: false
        }
      });

      render(<EventList />);

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });
    });

    it('should display PagoPa registry data correctly', async () => {
      (useParams as any).mockReturnValue({ registryType: 'pagopa' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: mockPagoPaRegistryData,
          isPending: false
        }
      });

      render(<EventList />);

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });
    });

    it('should show loading state when isPending is true', () => {
      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: undefined,
          isPending: true
        }
      });

      render(<EventList />);

      expect(
        screen.queryByText('Nessun risultato trovato')
      ).not.toBeInTheDocument();
    });
  });

  describe('Filter Management', () => {
    it('should allow typing in IUV input field', async () => {
      const user = userEvent.setup();
      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: undefined,
          isPending: false
        }
      });

      render(<EventList />);

      const iuvInput = screen.getByTestId('iuv').querySelector('input');
      expect(iuvInput).toBeInTheDocument();

      if (iuvInput) {
        await user.type(iuvInput, '123456789012345678');
        expect(iuvInput).toHaveValue('123456789012345678');
      }
    });

    it('should allow selecting event type from dropdown for SIL', async () => {
      const user = userEvent.setup();
      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: undefined,
          isPending: false
        }
      });

      render(<EventList />);

      const eventSelect = screen.getByRole('combobox', {
        name: /events\.searchEventDescription/i
      });
      expect(eventSelect).toBeInTheDocument();
      await user.click(eventSelect);
    });

    it('should allow selecting outcome from dropdown', async () => {
      const user = userEvent.setup();
      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: undefined,
          isPending: false
        }
      });

      render(<EventList />);

      const outcomeSelect = screen.getByRole('combobox', {
        name: /events\.searchEventOutcome/i
      });
      expect(outcomeSelect).toBeInTheDocument();
      await user.click(outcomeSelect);
    });

    it('should hide error when filters are corrected after an error', async () => {
      const user = userEvent.setup();
      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: undefined,
          isPending: false
        }
      });

      (noFilterSetted as any).mockReturnValue(true);
      (shouldShowGeneralError as any).mockReturnValue(true);

      render(<EventList />);

      const submitButton = screen.getByRole('button', { name: /cerca/i });
      await user.click(submitButton);

      expect(
        screen.getByText('Inserisci almeno un filtro per la ricerca')
      ).toBeInTheDocument();

      (noFilterSetted as any).mockReturnValue(false);
      const iuvInput = screen.getByTestId('iuv').querySelector('input');
      if (iuvInput) {
        await user.type(iuvInput, '123456');
      }

      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.queryByText('Inserisci almeno un filtro per la ricerca')
        ).not.toBeInTheDocument();
      });
    });

    it('should call applyFilters when submitting with valid filters', async () => {
      const user = userEvent.setup();
      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: undefined,
          isPending: false
        }
      });
      (noFilterSetted as any).mockReturnValue(false);

      render(<EventList />);

      const submitButton = screen.getByRole('button', { name: /cerca/i });
      await user.click(submitButton);

      expect(mockApplyFilters).toHaveBeenCalled();
    });

    it('should not call applyFilters when submitting with no filters', async () => {
      const user = userEvent.setup();
      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: undefined,
          isPending: false
        }
      });
      (noFilterSetted as any).mockReturnValue(true);
      (shouldShowGeneralError as any).mockReturnValue(true);

      render(<EventList />);

      const submitButton = screen.getByRole('button', { name: /cerca/i });
      await user.click(submitButton);

      expect(mockApplyFilters).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate to detail page when clicking ReadMore icon for SIL', async () => {
      const user = userEvent.setup();
      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: mockSilRegistryData,
          isPending: false
        }
      });

      render(<EventList />);

      await waitFor(() => {
        const readMoreButtons = screen.getAllByTestId('ReadMoreIcon');
        expect(readMoreButtons.length).toBeGreaterThan(0);
      });

      const readMoreButtons = screen.getAllByTestId('ReadMoreIcon');
      await user.click(readMoreButtons[0]);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining(
            '/piattaformaunitaria/backoffice/events/sil/sil-001'
          )
        );
      });
    });

    it('should navigate to detail page when clicking ReadMore icon for PagoPa', async () => {
      const user = userEvent.setup();
      (useParams as any).mockReturnValue({ registryType: 'pagopa' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: mockPagoPaRegistryData,
          isPending: false
        }
      });

      render(<EventList />);

      await waitFor(() => {
        const readMoreButtons = screen.getAllByTestId('ReadMoreIcon');
        expect(readMoreButtons.length).toBeGreaterThan(0);
      });

      const readMoreButtons = screen.getAllByTestId('ReadMoreIcon');
      await user.click(readMoreButtons[0]);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining(
            '/piattaformaunitaria/backoffice/events/pagopa/pagopa-001'
          )
        );
      });
    });
  });

  describe('Filter Container', () => {
    it('should render FilterContainer with correct items', () => {
      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: undefined,
          isPending: false
        }
      });

      render(<EventList />);

      const filterContainer = screen.getByTestId('filter-container');
      expect(filterContainer).toBeInTheDocument();
    });

    it('should pass values to FilterContainer', () => {
      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: undefined,
          isPending: false
        }
      });

      render(<EventList />);

      const filterContainer = screen.getByTestId('filter-container');
      expect(filterContainer).toBeInTheDocument();
    });
  });

  describe('API Calls', () => {
    it('should call getSilRegistries with correct organizationId for SIL', () => {
      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: undefined,
          isPending: false
        }
      });

      render(<EventList />);

      expect(getSilRegistries).toHaveBeenCalledWith(mockOrganizationId);
    });

    it('should call getPagoPaRegistries with correct organizationId for PagoPa', () => {
      (useParams as any).mockReturnValue({ registryType: 'pagopa' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: undefined,
          isPending: false
        }
      });

      render(<EventList />);

      expect(getPagoPaRegistries).toHaveBeenCalledWith(mockOrganizationId);
    });

    it('should pass query function to useSearch', () => {
      const mockQueryFunction = vi.fn();
      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (getSilRegistries as any).mockReturnValue(mockQueryFunction);
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: undefined,
          isPending: false
        }
      });

      render(<EventList />);

      expect(useSearch).toHaveBeenCalledWith({
        query: mockQueryFunction,
        filters: expect.any(Object)
      });
    });
  });

  describe('URL Hash Management', () => {
    it('should decode filters from URL hash on mount', () => {
      Object.defineProperty(window, 'location', {
        value: {
          hash: '#iuv=123456789012345678&dateFrom=2025-10-01'
        },
        writable: true,
        configurable: true
      });

      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: undefined,
          isPending: false
        }
      });

      render(<EventList />);

      expect(useSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.any(Object)
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle correctly when registryType is undefined', () => {
      (useParams as any).mockReturnValue({ registryType: undefined });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: undefined,
          isPending: false
        }
      });

      render(<EventList />);

      expect(getPagoPaRegistries).toHaveBeenCalledWith(mockOrganizationId);
    });

    it('should handle correctly when data.content is undefined', () => {
      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: {
            content: undefined,
            size: 20,
            totalElements: 0,
            totalPages: 0,
            number: 0
          } as any,
          isPending: false
        }
      });

      render(<EventList />);

      expect(screen.getByText('Nessun risultato trovato')).toBeInTheDocument();
    });

    it('should handle pagination correctly with multiple pages', () => {
      const multiPageData: PagedSilRegistry = {
        ...mockSilRegistryData,
        totalPages: 5,
        number: 2,
        totalElements: 100
      };

      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: multiPageData,
          isPending: false
        }
      });

      render(<EventList />);

      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('should handle correctly when data is completely undefined', () => {
      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: undefined,
          isPending: false
        }
      });

      render(<EventList />);

      expect(screen.getByText('Nessun risultato trovato')).toBeInTheDocument();
    });

    it('should handle correctly when organizationId changes', () => {
      const newOrganizationId = 99999;
      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useStore as any).mockReturnValue({
        state: {
          organizationId: newOrganizationId
        }
      });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: undefined,
          isPending: false
        }
      });

      render(<EventList />);

      expect(getSilRegistries).toHaveBeenCalledWith(newOrganizationId);
    });

    it('should handle correctly switching from one registry type to another', () => {
      const { rerender } = render(<EventList />);

      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: mockSilRegistryData,
          isPending: false
        }
      });

      rerender(<EventList />);

      (useParams as any).mockReturnValue({ registryType: 'pagopa' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: mockPagoPaRegistryData,
          isPending: false
        }
      });

      rerender(<EventList />);

      expect(getPagoPaRegistries).toHaveBeenCalledWith(mockOrganizationId);
    });

    it('should use getRowId to correctly identify rows', async () => {
      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: mockSilRegistryData,
          isPending: false
        }
      });

      render(<EventList />);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        expect(rows.length).toBeGreaterThan(2);
      });
    });
  });

  describe('ErrorMessage Behavior', () => {
    it('should show ErrorMessage only when error is true', () => {
      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: undefined,
          isPending: false
        }
      });
      (noFilterSetted as any).mockReturnValue(false);

      render(<EventList />);

      expect(
        screen.queryByText('Inserisci almeno un filtro per la ricerca')
      ).not.toBeInTheDocument();
    });

    it('should show ErrorMessage with variant="outlined"', async () => {
      const user = userEvent.setup();
      (useParams as any).mockReturnValue({ registryType: 'sil' });
      (useSearch as any).mockReturnValue({
        applyFilters: mockApplyFilters,
        query: {
          data: undefined,
          isPending: false
        }
      });
      (noFilterSetted as any).mockReturnValue(true);
      (shouldShowGeneralError as any).mockReturnValue(true);

      render(<EventList />);

      const submitButton = screen.getByRole('button', { name: /cerca/i });
      await user.click(submitButton);

      const errorMessage = screen.getByText(
        'Inserisci almeno un filtro per la ricerca'
      );
      expect(errorMessage).toBeInTheDocument();

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveClass('MuiAlert-outlinedError');
    });
  });
});
