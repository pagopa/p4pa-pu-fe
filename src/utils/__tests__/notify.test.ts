import { describe, expect, it, beforeEach } from 'vitest';
import notify from '../notify';

describe('notify', () => {
  beforeEach(() => {
    notify.dismiss();
    notify.status.payload.value = {};
  });

  describe('emit', () => {
    it('should emit notification with text and default severity', () => {
      const testMessage = 'Test notification message';

      notify.emit(testMessage);

      expect(notify.status.isVisible.value).toBe(true);
      expect(notify.status.payload.value.text).toBe(testMessage);
      expect(notify.status.payload.value.severity).toBe('error');
    });

    it('should emit notification with custom severity', () => {
      const testMessage = 'Success message';
      const customSeverity = 'success';

      notify.emit(testMessage, customSeverity);

      expect(notify.status.isVisible.value).toBe(true);
      expect(notify.status.payload.value.text).toBe(testMessage);
      expect(notify.status.payload.value.severity).toBe(customSeverity);
    });

    it('should emit notification with warning severity', () => {
      const testMessage = 'Warning message';

      notify.emit(testMessage, 'warning');

      expect(notify.status.isVisible.value).toBe(true);
      expect(notify.status.payload.value.text).toBe(testMessage);
      expect(notify.status.payload.value.severity).toBe('warning');
    });

    it('should emit notification with info severity', () => {
      const testMessage = 'Info message';

      notify.emit(testMessage, 'info');

      expect(notify.status.isVisible.value).toBe(true);
      expect(notify.status.payload.value.text).toBe(testMessage);
      expect(notify.status.payload.value.severity).toBe('info');
    });

    it('should overwrite previous notification when called multiple times', () => {
      notify.emit('First message', 'error');
      notify.emit('Second message', 'success');

      expect(notify.status.isVisible.value).toBe(true);
      expect(notify.status.payload.value.text).toBe('Second message');
      expect(notify.status.payload.value.severity).toBe('success');
    });

    it('should handle empty text', () => {
      notify.emit('');

      expect(notify.status.isVisible.value).toBe(true);
      expect(notify.status.payload.value.text).toBe('');
      expect(notify.status.payload.value.severity).toBe('error');
    });

    it('should handle text with special characters', () => {
      const specialText = 'Errore: connessione fallita! Riprovare più tardi...';

      notify.emit(specialText, 'error');

      expect(notify.status.isVisible.value).toBe(true);
      expect(notify.status.payload.value.text).toBe(specialText);
      expect(notify.status.payload.value.severity).toBe('error');
    });
  });

  describe('dismiss', () => {
    it('should dismiss notification', () => {
      notify.emit('Test message');
      expect(notify.status.isVisible.value).toBe(true);

      notify.dismiss();

      expect(notify.status.isVisible.value).toBe(false);
    });

    it('should dismiss notification without affecting payload', () => {
      const testMessage = 'Test message';
      notify.emit(testMessage, 'warning');

      notify.dismiss();

      expect(notify.status.isVisible.value).toBe(false);
      expect(notify.status.payload.value.text).toBe(testMessage);
      expect(notify.status.payload.value.severity).toBe('warning');
    });

    it('should be safe to call dismiss multiple times', () => {
      notify.emit('Test message');
      notify.dismiss();
      notify.dismiss();

      expect(notify.status.isVisible.value).toBe(false);
    });

    it('should be safe to call dismiss when no notification is active', () => {
      expect(notify.status.isVisible.value).toBe(false);

      notify.dismiss();

      expect(notify.status.isVisible.value).toBe(false);
    });
  });

  describe('status', () => {
    it('should expose isVisible signal', () => {
      expect(notify.status.isVisible).toBeDefined();
      expect(typeof notify.status.isVisible.value).toBe('boolean');
    });

    it('should expose payload signal', () => {
      expect(notify.status.payload).toBeDefined();
      expect(typeof notify.status.payload.value).toBe('object');
    });

    it('should have correct initial state', () => {
      notify.dismiss();
      notify.status.payload.value = {};

      expect(notify.status.isVisible.value).toBe(false);
      expect(notify.status.payload.value).toEqual({});
    });

    it('should allow direct access to signal values', () => {
      notify.emit('Direct access test', 'info');

      const { isVisible, payload } = notify.status;

      expect(isVisible.value).toBe(true);
      expect(payload.value.text).toBe('Direct access test');
      expect(payload.value.severity).toBe('info');
    });
  });

  describe('workflow scenarios', () => {
    it('should handle emit -> dismiss -> emit workflow', () => {
      notify.emit('First notification', 'error');
      expect(notify.status.isVisible.value).toBe(true);
      expect(notify.status.payload.value.text).toBe('First notification');

      notify.dismiss();
      expect(notify.status.isVisible.value).toBe(false);

      notify.emit('Second notification', 'success');
      expect(notify.status.isVisible.value).toBe(true);
      expect(notify.status.payload.value.text).toBe('Second notification');
      expect(notify.status.payload.value.severity).toBe('success');
    });

    it('should handle multiple rapid emissions', () => {
      notify.emit('Message 1', 'error');
      notify.emit('Message 2', 'warning');
      notify.emit('Message 3', 'info');
      notify.emit('Final message', 'success');

      expect(notify.status.isVisible.value).toBe(true);
      expect(notify.status.payload.value.text).toBe('Final message');
      expect(notify.status.payload.value.severity).toBe('success');
    });

    it('should handle emit after dismiss without previous emit', () => {
      notify.dismiss();
      notify.emit('New message', 'info');

      expect(notify.status.isVisible.value).toBe(true);
      expect(notify.status.payload.value.text).toBe('New message');
      expect(notify.status.payload.value.severity).toBe('info');
    });
  });
});
