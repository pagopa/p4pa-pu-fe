/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable sonarjs/no-nested-functions */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '../../../__tests__/renderers';
import { useConfirmDialog, DialogAction } from './useConfirmDialog';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';

i18nTestSetup({
  'commons.close': 'Chiudi',
  'commons.delete': 'Elimina',
  'commons.disable': 'Disabilita',
  'commons.enable': 'Abilita',
  'commons.confirm': 'Conferma',
  'debtTypeCatalogDetail.confirmDialog.title': 'Conferma Eliminazione',
  'debtTypeCatalogDetail.confirmDialog.description':
    'Sei sicuro di voler eliminare questo elemento?',
  'debtTypeDetail.confirmDisableDialog.title': 'Conferma Disabilitazione',
  'debtTypeDetail.confirmDisableDialog.description':
    'Sei sicuro di voler disabilitare questo elemento?',
  'debtTypeDetail.confirmEnableDialog.title': 'Conferma Abilitazione',
  'debtTypeDetail.confirmEnableDialog.description':
    'Sei sicuro di voler abilitare questo elemento?',
  'debtTypeCatalogDetail.errorDialog.title': 'Errore',
  'debtTypeCatalogDetail.errorDialog.genericErrorDescription':
    'Si è verificato un errore',
  'debtTypeCatalogDetail.errorDialog.alreadyUsedDescription':
    'Elemento già in uso'
});

describe('useConfirmDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial state', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useConfirmDialog());

      expect(result.current.isOpen).toBe(false);
      expect(result.current.currentAction).toBe(null);
      expect(typeof result.current.showDialog).toBe('function');
      expect(typeof result.current.closeDialog).toBe('function');
      expect(typeof result.current.handleConfirm).toBe('function');
      expect(typeof result.current.showDeleteDialog).toBe('function');
      expect(typeof result.current.showDisableDialog).toBe('function');
      expect(typeof result.current.showEnableDialog).toBe('function');
      expect(typeof result.current.showErrorDialog).toBe('function');
      expect(typeof result.current.showConfirmDialog).toBe('function');
    });
  });

  describe('showDialog', () => {
    it('should open dialog with provided action', () => {
      const { result } = renderHook(() => useConfirmDialog());
      const mockAction: DialogAction = {
        title: 'Test Title',
        message: 'Test Message',
        confirmLabel: 'Test Confirm'
      };

      act(() => {
        result.current.showDialog(mockAction);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.currentAction).toEqual({
        ...mockAction,
        cancelLabel: 'Chiudi',
        showCancel: true,
        variant: 'default'
      });
    });

    it('should merge provided action with defaults', () => {
      const { result } = renderHook(() => useConfirmDialog());
      const mockAction: DialogAction = {
        title: 'Custom Title',
        message: 'Custom Message',
        confirmLabel: 'Custom Confirm',
        variant: 'error',
        showCancel: false
      };

      act(() => {
        result.current.showDialog(mockAction);
      });

      expect(result.current.currentAction).toEqual({
        ...mockAction,
        cancelLabel: 'Chiudi'
      });
    });

    it('should override defaults with provided values', () => {
      const { result } = renderHook(() => useConfirmDialog());
      const mockAction: DialogAction = {
        title: 'Test',
        message: 'Test',
        confirmLabel: 'Test',
        cancelLabel: 'Custom Cancel',
        showCancel: false,
        variant: 'warning'
      };

      act(() => {
        result.current.showDialog(mockAction);
      });

      expect(result.current.currentAction?.cancelLabel).toBe('Custom Cancel');
      expect(result.current.currentAction?.showCancel).toBe(false);
      expect(result.current.currentAction?.variant).toBe('warning');
    });
  });

  describe('closeDialog', () => {
    it('should close dialog and reset current action', () => {
      const { result } = renderHook(() => useConfirmDialog());
      const mockAction: DialogAction = {
        title: 'Test',
        message: 'Test',
        confirmLabel: 'Test'
      };

      act(() => {
        result.current.showDialog(mockAction);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.currentAction).not.toBe(null);

      act(() => {
        result.current.closeDialog();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.currentAction).toBe(null);
    });
  });

  describe('handleConfirm', () => {
    it('should call onConfirm and close dialog on success', async () => {
      const { result } = renderHook(() => useConfirmDialog());
      const mockOnConfirm = vi.fn().mockResolvedValue(undefined);
      const mockAction: DialogAction = {
        title: 'Test',
        message: 'Test',
        confirmLabel: 'Test',
        onConfirm: mockOnConfirm
      };

      act(() => {
        result.current.showDialog(mockAction);
      });

      await act(async () => {
        await result.current.handleConfirm();
      });

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(result.current.isOpen).toBe(false);
      expect(result.current.currentAction).toBe(null);
    });

    it('should handle onConfirm that returns a promise', async () => {
      const { result } = renderHook(() => useConfirmDialog());
      const mockOnConfirm = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100))
        );
      const mockAction: DialogAction = {
        title: 'Test',
        message: 'Test',
        confirmLabel: 'Test',
        onConfirm: mockOnConfirm
      };

      act(() => {
        result.current.showDialog(mockAction);
      });

      await act(async () => {
        await result.current.handleConfirm();
      });

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(result.current.isOpen).toBe(false);
    });

    it('should handle error in onConfirm and not close dialog', async () => {
      const { result } = renderHook(() => useConfirmDialog());
      const mockError = new Error('Test error');
      const mockOnConfirm = vi.fn().mockRejectedValue(mockError);
      const mockAction: DialogAction = {
        title: 'Test',
        message: 'Test',
        confirmLabel: 'Test',
        onConfirm: mockOnConfirm
      };

      act(() => {
        result.current.showDialog(mockAction);
      });

      await act(async () => {
        await result.current.handleConfirm();
      });

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        'Error during dialog confirmation:',
        mockError
      );
      expect(result.current.isOpen).toBe(true);
      expect(result.current.currentAction).not.toBe(null);
    });

    it('should close dialog when no onConfirm is provided', async () => {
      const { result } = renderHook(() => useConfirmDialog());
      const mockAction: DialogAction = {
        title: 'Test',
        message: 'Test',
        confirmLabel: 'Test'
      };

      act(() => {
        result.current.showDialog(mockAction);
      });

      await act(async () => {
        await result.current.handleConfirm();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.currentAction).toBe(null);
    });
  });

  describe('showDeleteDialog', () => {
    it('should show delete dialog with correct configuration', () => {
      const { result } = renderHook(() => useConfirmDialog());
      const mockOnConfirm = vi.fn();

      act(() => {
        result.current.showDeleteDialog(mockOnConfirm);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.currentAction).toEqual({
        title: 'Conferma Eliminazione',
        message: 'Sei sicuro di voler eliminare questo elemento?',
        confirmLabel: 'Elimina',
        cancelLabel: 'Chiudi',
        onConfirm: mockOnConfirm,
        variant: 'error',
        testId: 'confirm-delete-dialog',
        showCancel: true
      });
    });
  });

  describe('showDisableDialog', () => {
    it('should show disable dialog with correct configuration', () => {
      const { result } = renderHook(() => useConfirmDialog());
      const mockOnConfirm = vi.fn();

      act(() => {
        result.current.showDisableDialog(mockOnConfirm);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.currentAction).toEqual({
        title: 'Conferma Disabilitazione',
        message: 'Sei sicuro di voler disabilitare questo elemento?',
        confirmLabel: 'Disabilita',
        cancelLabel: 'Chiudi',
        onConfirm: mockOnConfirm,
        variant: 'warning',
        testId: 'confirm-disable-dialog',
        showCancel: true
      });
    });
  });

  describe('showEnableDialog', () => {
    it('should show enable dialog with correct configuration', () => {
      const { result } = renderHook(() => useConfirmDialog());
      const mockOnConfirm = vi.fn();

      act(() => {
        result.current.showEnableDialog(mockOnConfirm);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.currentAction).toEqual({
        title: 'Conferma Abilitazione',
        message: 'Sei sicuro di voler abilitare questo elemento?',
        confirmLabel: 'Abilita',
        cancelLabel: 'Chiudi',
        onConfirm: mockOnConfirm,
        variant: 'success',
        testId: 'confirm-enable-dialog',
        showCancel: true
      });
    });
  });

  describe('showErrorDialog', () => {
    it('should show error dialog with default error type', () => {
      const { result } = renderHook(() => useConfirmDialog());

      act(() => {
        result.current.showErrorDialog();
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.currentAction).toEqual({
        title: 'Errore',
        message: 'Si è verificato un errore',
        confirmLabel: 'Chiudi',
        cancelLabel: 'Chiudi',
        variant: 'error',
        testId: 'error-dialog',
        showCancel: false
      });
    });

    it('should show error dialog with specific error type', () => {
      const { result } = renderHook(() => useConfirmDialog());

      act(() => {
        result.current.showErrorDialog('alreadyUsedDescription');
      });

      expect(result.current.currentAction?.message).toBe('Elemento già in uso');
    });

    it('should show error dialog with custom message', () => {
      const { result } = renderHook(() => useConfirmDialog());
      const customMessage = 'Custom error message';

      act(() => {
        result.current.showErrorDialog(
          'genericErrorDescription',
          customMessage
        );
      });

      expect(result.current.currentAction?.message).toBe(customMessage);
    });

    it('should prioritize custom message over error type', () => {
      const { result } = renderHook(() => useConfirmDialog());
      const customMessage = 'Priority custom message';

      act(() => {
        result.current.showErrorDialog('alreadyUsedDescription', customMessage);
      });

      expect(result.current.currentAction?.message).toBe(customMessage);
    });
  });

  describe('showConfirmDialog', () => {
    it('should show confirm dialog with provided parameters', () => {
      const { result } = renderHook(() => useConfirmDialog());
      const mockOnConfirm = vi.fn();
      const title = 'Custom Title';
      const message = 'Custom Message';

      act(() => {
        result.current.showConfirmDialog(title, message, mockOnConfirm);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.currentAction).toEqual({
        title,
        message,
        confirmLabel: 'Conferma',
        cancelLabel: 'Chiudi',
        onConfirm: mockOnConfirm,
        variant: 'default',
        showCancel: true
      });
    });

    it('should merge options with defaults', () => {
      const { result } = renderHook(() => useConfirmDialog());
      const mockOnConfirm = vi.fn();
      const options = {
        variant: 'warning' as const,
        testId: 'custom-test-id',
        showCancel: false
      };

      act(() => {
        result.current.showConfirmDialog(
          'Title',
          'Message',
          mockOnConfirm,
          options
        );
      });

      expect(result.current.currentAction).toEqual({
        title: 'Title',
        message: 'Message',
        confirmLabel: 'Conferma',
        cancelLabel: 'Chiudi',
        onConfirm: mockOnConfirm,
        variant: 'warning',
        testId: 'custom-test-id',
        showCancel: false
      });
    });

    it('should work with empty options', () => {
      const { result } = renderHook(() => useConfirmDialog());
      const mockOnConfirm = vi.fn();

      act(() => {
        result.current.showConfirmDialog('Title', 'Message', mockOnConfirm, {});
      });

      expect(result.current.currentAction?.variant).toBe('default');
      expect(result.current.currentAction?.confirmLabel).toBe('Conferma');
    });
  });

  describe('Integration tests', () => {
    it('should handle multiple dialog operations in sequence', async () => {
      const { result } = renderHook(() => useConfirmDialog());
      const mockOnConfirm1 = vi.fn().mockResolvedValue(undefined);
      const mockOnConfirm2 = vi.fn();

      act(() => {
        result.current.showDeleteDialog(mockOnConfirm1);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.currentAction?.variant).toBe('error');

      await act(async () => {
        await result.current.handleConfirm();
      });

      expect(mockOnConfirm1).toHaveBeenCalledTimes(1);
      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.showEnableDialog(mockOnConfirm2);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.currentAction?.variant).toBe('success');

      act(() => {
        result.current.closeDialog();
      });

      expect(mockOnConfirm2).not.toHaveBeenCalled();
      expect(result.current.isOpen).toBe(false);
    });

    it('should handle synchronous and asynchronous onConfirm functions', async () => {
      const { result } = renderHook(() => useConfirmDialog());
      const syncOnConfirm = vi.fn();
      const asyncOnConfirm = vi.fn().mockResolvedValue(undefined);

      act(() => {
        result.current.showConfirmDialog('Sync', 'Message', syncOnConfirm);
      });

      await act(async () => {
        await result.current.handleConfirm();
      });

      expect(syncOnConfirm).toHaveBeenCalledTimes(1);
      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.showConfirmDialog('Async', 'Message', asyncOnConfirm);
      });

      await act(async () => {
        await result.current.handleConfirm();
      });

      expect(asyncOnConfirm).toHaveBeenCalledTimes(1);
      expect(result.current.isOpen).toBe(false);
    });
  });
});
