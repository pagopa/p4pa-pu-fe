import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearchParams } from 'react-router-dom';
import { useDataGridPaginationWithUrl } from './useDataGridPaginationWithUrl';

// Mock di useSearchParams
vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn()
}));

describe('useDataGridPaginationWithUrl', () => {
  const mockSetSearchParams = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSearchParams as Mock).mockImplementation(() => [
      new URLSearchParams(),
      mockSetSearchParams
    ]);
  });

  describe('Modalità senza URL sync (compatibilità con useDataGridPagination)', () => {
    it('dovrebbe inizializzare con valori di default', () => {
      const { result } = renderHook(() => useDataGridPaginationWithUrl());

      expect(result.current.pagination).toEqual({
        page: 0,
        size: 10,
        currentPage: 1
      });
    });

    it('dovrebbe inizializzare con parametri personalizzati', () => {
      const { result } = renderHook(() =>
        useDataGridPaginationWithUrl({
          initialPage: 2,
          initialSize: 20
        })
      );

      expect(result.current.pagination).toEqual({
        page: 2,
        size: 20,
        currentPage: 3
      });
    });

    it('dovrebbe gestire il cambio pagina correttamente', () => {
      const onPaginationChange = vi.fn();
      const { result } = renderHook(() =>
        useDataGridPaginationWithUrl({
          onPaginationChange
        })
      );

      act(() => {
        result.current.handlePageChange(3); // Input 1-based
      });

      expect(result.current.pagination.page).toBe(2); // Interno 0-based
      expect(result.current.pagination.currentPage).toBe(3); // UI 1-based
      expect(onPaginationChange).toHaveBeenCalledWith({ page: 2, size: 10 });
      expect(mockSetSearchParams).not.toHaveBeenCalled(); // No URL sync
    });

    it('dovrebbe gestire il cambio dimensione pagina', () => {
      const onPaginationChange = vi.fn();
      const { result } = renderHook(() =>
        useDataGridPaginationWithUrl({
          onPaginationChange,
          totalElements: 50
        })
      );

      // Vai a pagina 3
      act(() => {
        result.current.handlePageChange(3);
      });

      // Cambia dimensione - dovrebbe rimanere nella stessa pagina se possibile
      act(() => {
        result.current.handlePageSizeChange(20);
      });

      expect(result.current.pagination).toEqual({
        page: 2, // Rimane pagina 3 (0-based = 2)
        size: 20,
        currentPage: 3
      });
      expect(onPaginationChange).toHaveBeenLastCalledWith({
        page: 2,
        size: 20
      });
    });

    it('dovrebbe gestire overflow pagine quando si cambia dimensione', () => {
      const { result } = renderHook(() =>
        useDataGridPaginationWithUrl({
          totalElements: 25
        })
      );

      // Vai a pagina 3 con size 10 (25 elementi = 3 pagine)
      act(() => {
        result.current.handlePageChange(3);
      });

      // Cambia size a 20 (25 elementi = 2 pagine) - dovrebbe andare a pagina 2
      act(() => {
        const newPage = result.current.handlePageSizeChange(20);
        expect(newPage).toBe(2);
      });

      expect(result.current.pagination.currentPage).toBe(2);
    });
  });

  describe('Modalità con URL sync', () => {
    it('dovrebbe inizializzare leggendo parametri URL', () => {
      const mockSearchParams = new URLSearchParams('?page=3&size=25');
      (useSearchParams as Mock).mockImplementation(() => [
        mockSearchParams,
        mockSetSearchParams
      ]);

      const { result } = renderHook(() =>
        useDataGridPaginationWithUrl({
          enableUrlSync: true
        })
      );

      expect(result.current.pagination).toEqual({
        page: 2, // URL 1-based (3) → interno 0-based (2)
        size: 25,
        currentPage: 3
      });
    });

    it('dovrebbe aggiornare URL quando cambia pagina', () => {
      const { result } = renderHook(() =>
        useDataGridPaginationWithUrl({
          enableUrlSync: true
        })
      );

      act(() => {
        result.current.handlePageChange(4);
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.any(URLSearchParams),
        { replace: true }
      );

      const calledParams = mockSetSearchParams.mock.calls[0][0];
      expect(calledParams.get('page')).toBe('4');
      expect(calledParams.get('size')).toBe('10');
    });

    it('dovrebbe aggiornare URL quando cambia dimensione pagina', () => {
      const { result } = renderHook(() =>
        useDataGridPaginationWithUrl({
          enableUrlSync: true,
          totalElements: 100
        })
      );

      act(() => {
        result.current.handlePageSizeChange(25);
      });

      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.any(URLSearchParams),
        { replace: true }
      );

      const calledParams = mockSetSearchParams.mock.calls[0][0];
      expect(calledParams.get('page')).toBe('1');
      expect(calledParams.get('size')).toBe('25');
    });

    it('dovrebbe sincronizzare con dati backend', () => {
      const { result } = renderHook(() =>
        useDataGridPaginationWithUrl({
          enableUrlSync: true
        })
      );

      const backendData = {
        number: 1, // Backend 0-based
        size: 15,
        totalElements: 100,
        totalPages: 7
      };

      act(() => {
        result.current.syncWithBackendData(backendData);
      });

      expect(result.current.pagination).toEqual({
        page: 1, // Backend 0-based
        size: 15,
        currentPage: 2 // UI 1-based
      });

      // Dovrebbe aggiornare URL
      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.any(URLSearchParams),
        { replace: true }
      );

      const calledParams = mockSetSearchParams.mock.calls[0][0];
      expect(calledParams.get('page')).toBe('2'); // Backend 0-based (1) → URL 1-based (2)
      expect(calledParams.get('size')).toBe('15');
    });

    it('dovrebbe gestire caso edge: pagina URL > totalPages', () => {
      const mockSearchParams = new URLSearchParams('?page=10&size=10');
      (useSearchParams as Mock).mockImplementation(() => [
        mockSearchParams,
        mockSetSearchParams
      ]);

      const { result } = renderHook(() =>
        useDataGridPaginationWithUrl({
          enableUrlSync: true
        })
      );

      const backendData = {
        number: 0,
        size: 10,
        totalElements: 15,
        totalPages: 2 // Solo 2 pagine disponibili, ma URL ha page=10
      };

      act(() => {
        result.current.syncWithBackendData(backendData);
      });

      // Dovrebbe resettare a pagina 1
      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.any(URLSearchParams),
        { replace: true }
      );

      const calledParams = mockSetSearchParams.mock.calls[0][0];
      expect(calledParams.get('page')).toBe('1');
      expect(calledParams.get('size')).toBe('10');
    });

    it('dovrebbe aggiornare totalElements tramite setter', () => {
      const { result } = renderHook(() =>
        useDataGridPaginationWithUrl({
          enableUrlSync: true
        })
      );

      // Prima aggiorna il totale elementi
      act(() => {
        result.current.setTotalElements(150);
      });

      // Poi vai a pagina 5
      act(() => {
        result.current.handlePageChange(5);
      });

      // Poi cambia size: con 150 elementi e size 30 = 5 pagine max, pagina 5 dovrebbe rimanere valida
      act(() => {
        result.current.handlePageSizeChange(30);
      });

      expect(result.current.pagination.currentPage).toBe(5); // Dovrebbe rimanere valido
    });
  });

  describe('Modalità senza URL sync ma con syncWithBackendData chiamato', () => {
    it('non dovrebbe fare nulla se enableUrlSync è false', () => {
      const { result } = renderHook(() =>
        useDataGridPaginationWithUrl({
          enableUrlSync: false
        })
      );

      const backendData = {
        number: 3,
        size: 20,
        totalElements: 100,
        totalPages: 5
      };

      act(() => {
        result.current.syncWithBackendData(backendData);
      });

      // Stato dovrebbe rimanere invariato
      expect(result.current.pagination).toEqual({
        page: 0,
        size: 10,
        currentPage: 1
      });

      expect(mockSetSearchParams).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('dovrebbe gestire valori non validi in URL', () => {
      const mockSearchParams = new URLSearchParams('?page=invalid&size=abc');
      (useSearchParams as Mock).mockImplementation(() => [
        mockSearchParams,
        mockSetSearchParams
      ]);

      const { result } = renderHook(() =>
        useDataGridPaginationWithUrl({
          enableUrlSync: true,
          initialSize: 15
        })
      );

      // Dovrebbe fallback ai valori di default
      expect(result.current.pagination).toEqual({
        page: 0, // page='invalid' → NaN → fallback a '1' → 0-based = 0
        size: 15, // size='abc' → NaN → fallback a initialSize
        currentPage: 1
      });
    });

    it('dovrebbe gestire totalElements = 0', () => {
      const { result } = renderHook(() =>
        useDataGridPaginationWithUrl({
          totalElements: 0
        })
      );

      act(() => {
        result.current.handlePageSizeChange(20);
      });

      // Con 0 elementi, dovrebbe andare a pagina 1
      expect(result.current.pagination.currentPage).toBe(1);
    });
  });
});
