import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { useSearchParams } from 'react-router-dom';
import usePaginationSync from './usePaginationSync';

// Mock di react-router-dom
vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn()
}));

describe('usePaginationSync', () => {
  const mockSetSearchParams = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSearchParams as Mock).mockImplementation(() => [
      new URLSearchParams(),
      mockSetSearchParams
    ]);
  });

  it('dovrebbe aggiornare totalElements quando cambiano i dati di paginazione', () => {
    const mockSetTotalElements = vi.fn();

    renderHook(() =>
      usePaginationSync({
        paginationData: {
          number: 0,
          size: 10,
          totalElements: 100,
          totalPages: 10
        },
        onPageChange: vi.fn(),
        onPageSizeChange: vi.fn(),
        totalElements: 0,
        setTotalElements: mockSetTotalElements
      })
    );

    expect(mockSetTotalElements).toHaveBeenCalledWith(100);
  });

  it('dovrebbe resettare la pagina a 1 quando la pagina corrente supera il totale delle pagine', () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('page', '5');
    mockSearchParams.set('size', '10');

    (useSearchParams as Mock).mockImplementation(() => [
      mockSearchParams,
      mockSetSearchParams
    ]);

    renderHook(() =>
      usePaginationSync({
        paginationData: {
          number: 4,
          size: 10,
          totalElements: 20,
          totalPages: 2
        },
        onPageChange: vi.fn(),
        onPageSizeChange: vi.fn(),
        totalElements: 20,
        setTotalElements: vi.fn()
      })
    );

    expect(mockSetSearchParams).toHaveBeenCalledWith(
      expect.any(URLSearchParams),
      { replace: true }
    );

    const calledParams = mockSetSearchParams.mock.calls[0][0];
    expect(calledParams.get('page')).toBe('1');
    expect(calledParams.get('size')).toBe('10');
  });

  it("dovrebbe sincronizzare i parametri di paginazione con l'URL", () => {
    renderHook(() =>
      usePaginationSync({
        paginationData: {
          number: 2, // 0-based index
          size: 15,
          totalElements: 100,
          totalPages: 7
        },
        onPageChange: vi.fn(),
        onPageSizeChange: vi.fn(),
        totalElements: 100,
        setTotalElements: vi.fn()
      })
    );

    expect(mockSetSearchParams).toHaveBeenCalledWith(
      expect.any(URLSearchParams),
      { replace: true }
    );

    const calledParams = mockSetSearchParams.mock.calls[0][0];
    expect(calledParams.get('page')).toBe('3'); // 1-based index nell'URL
    expect(calledParams.get('size')).toBe('15');
  });

  it('dovrebbe esporre correttamente le funzioni di gestione della paginazione', () => {
    const mockOnPageChange = vi.fn();
    const mockOnPageSizeChange = vi.fn();

    const { result } = renderHook(() =>
      usePaginationSync({
        paginationData: {
          number: 0,
          size: 10,
          totalElements: 100,
          totalPages: 10
        },
        onPageChange: mockOnPageChange,
        onPageSizeChange: mockOnPageSizeChange,
        totalElements: 100,
        setTotalElements: vi.fn()
      })
    );

    result.current.handlePageChange(2);
    result.current.handlePageSizeChange(20);

    expect(mockOnPageChange).toHaveBeenCalledWith(2);
    expect(mockOnPageSizeChange).toHaveBeenCalledWith(20);
  });
});
