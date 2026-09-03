import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook } from '../__tests__/renderers';
import { i18nTestSetup } from '../__tests__/i18nTestSetup';
import {
  useTimelineData,
  getEventStatusColor,
  getEventDisplayInfo,
  RegistryItem
} from './useTimelineData';
import { PaymentEventType } from '../../generated/core/data-contracts';

const mockRegistryWithEventType: RegistryItem = {
  eventDateTime: '2025-05-16T10:45:30.987654Z',
  eventType: PaymentEventType.DPI_ADDED,
  eventDescription: 'Aggiunta prima rata di pagamento'
};

const mockRegistryWithoutEventType: RegistryItem = {
  eventDateTime: '2025-05-17T14:22:45.567890Z',
  eventDescription: 'Evento generico senza tipo'
};

const mockRegistriesMultiple: Array<RegistryItem> = [
  {
    eventDateTime: '2025-05-15T08:30:15.123456Z',
    eventType: PaymentEventType.DP_CREATED,
    eventDescription: 'Posizione debitoria creata'
  },
  {
    eventDateTime: '2025-05-17T14:22:45.567890Z',
    eventType: PaymentEventType.IO_NOTIFIED,
    eventDescription: 'Notifica IO inviata'
  },
  {
    eventDateTime: '2025-05-16T10:45:30.987654Z',
    eventType: PaymentEventType.DPI_ADDED,
    eventDescription: 'Prima rata aggiunta'
  }
];

const mockTranslations = {
  'commons.DP_DESCRIPTION.DPI_ADDED': 'Rata di pagamento aggiunta',
  'commons.DP_STATUS.DPI_ADDED': 'Rata Aggiunta',
  'commons.DP_DESCRIPTION.DP_CREATED': 'Posizione debitoria creata nel sistema',
  'commons.DP_STATUS.DP_CREATED': 'Creata',
  'commons.DP_DESCRIPTION.IO_NOTIFIED': 'Notifica inviata tramite app IO',
  'commons.DP_STATUS.IO_NOTIFIED': 'Notificato',
  'commons.DP_STATUS.UNKNOWN': 'Stato sconosciuto'
};

describe('useTimelineData', () => {
  beforeEach(() => {
    i18nTestSetup(mockTranslations);
  });

  describe('hook behavior', () => {
    it('returns empty array when registries is null or undefined', () => {
      const { result: resultNull } = renderHook(() =>
        useTimelineData(null as unknown as Array<RegistryItem>)
      );
      const { result: resultUndefined } = renderHook(() =>
        useTimelineData(undefined as unknown as Array<RegistryItem>)
      );

      expect(resultNull.current).toEqual([]);
      expect(resultUndefined.current).toEqual([]);
    });

    it('returns empty array when registries is empty', () => {
      const { result } = renderHook(() => useTimelineData([]));

      expect(result.current).toEqual([]);
    });

    it('processes single registry with eventType correctly', () => {
      const { result } = renderHook(() =>
        useTimelineData([mockRegistryWithEventType])
      );

      expect(result.current).toHaveLength(1);

      const timelineElement = result.current[0];
      expect(timelineElement.date).toEqual(
        new Date('2025-05-16T10:45:30.987654Z')
      );
      expect(timelineElement.isFirst).toBe(true);
      expect(timelineElement.isLast).toBe(true);
      expect(timelineElement.statusChip).toEqual({
        label: 'Rata Aggiunta',
        color: 'success'
      });
    });

    it('processes single registry without eventType correctly', () => {
      const { result } = renderHook(() =>
        useTimelineData([mockRegistryWithoutEventType])
      );

      expect(result.current).toHaveLength(1);

      const timelineElement = result.current[0];
      expect(timelineElement.date).toEqual(
        new Date('2025-05-17T14:22:45.567890Z')
      );
      expect(timelineElement.isFirst).toBe(true);
      expect(timelineElement.isLast).toBe(true);
      expect(timelineElement.statusChip).toBeUndefined();
    });

    it('sorts registries by date (most recent first)', () => {
      const { result } = renderHook(() =>
        useTimelineData(mockRegistriesMultiple)
      );

      expect(result.current).toHaveLength(3);

      const dates = result.current.map((element) => element.date.getTime());
      expect(dates[0]).toBeGreaterThan(dates[1]);
      expect(dates[1]).toBeGreaterThan(dates[2]);

      expect(result.current[0].date).toEqual(
        new Date('2025-05-17T14:22:45.567890Z')
      );

      expect(result.current[2].date).toEqual(
        new Date('2025-05-15T08:30:15.123456Z')
      );
    });

    it('sets isFirst and isLast flags correctly', () => {
      const { result } = renderHook(() =>
        useTimelineData(mockRegistriesMultiple)
      );

      expect(result.current[0].isFirst).toBe(true);
      expect(result.current[0].isLast).toBe(false);

      expect(result.current[1].isFirst).toBe(false);
      expect(result.current[1].isLast).toBe(false);

      expect(result.current[2].isFirst).toBe(false);
      expect(result.current[2].isLast).toBe(true);
    });

    it('handles registries with missing eventDateTime', () => {
      const registryWithoutDate: RegistryItem = {
        eventType: PaymentEventType.DPI_ADDED,
        eventDescription: 'Evento senza data'
      };

      const { result } = renderHook(() =>
        useTimelineData([registryWithoutDate])
      );

      expect(result.current).toHaveLength(1);
      expect(result.current[0].date).toBeInstanceOf(Date);
    });

    it('memoizes results correctly', () => {
      const { result, rerender } = renderHook(
        ({ registries }) => useTimelineData(registries),
        { initialProps: { registries: mockRegistriesMultiple } }
      );

      const firstResult = result.current;

      rerender({ registries: mockRegistriesMultiple });
      expect(result.current).toBe(firstResult);

      rerender({ registries: [mockRegistryWithEventType] });
      expect(result.current).not.toBe(firstResult);
    });
  });

  describe('content rendering', () => {
    it('renders content with translation when description is available', () => {
      const { result } = renderHook(() =>
        useTimelineData([mockRegistryWithEventType])
      );

      const timelineElement = result.current[0];
      expect(timelineElement.content.props.children).toBe(
        'Rata di pagamento aggiunta'
      );
    });

    it('renders original description when translation is not available', () => {
      const registryWithoutTranslation: RegistryItem = {
        eventDateTime: '2025-05-16T10:45:30.987654Z',
        eventType: PaymentEventType.SYNC_ERROR,
        eventDescription: 'Errore di sincronizzazione'
      };

      const { result } = renderHook(() =>
        useTimelineData([registryWithoutTranslation])
      );

      const timelineElement = result.current[0];
      expect(timelineElement.content.props.children).toBe(
        'Errore di sincronizzazione'
      );
    });

    it('renders eventDescription when no description translation exists but status does', () => {
      const customTranslations = {
        'commons.DP_STATUS.DPI_ADDED': 'Rata Aggiunta'
      };

      i18nTestSetup(customTranslations);

      const registryStatusOnly: RegistryItem = {
        eventDateTime: '2025-05-16T10:45:30.987654Z',
        eventType: PaymentEventType.DPI_ADDED,
        eventDescription: 'Fallback description'
      };

      const { result } = renderHook(() =>
        useTimelineData([registryStatusOnly])
      );

      const timelineElement = result.current[0];
      expect(timelineElement.content.props.children).toBe(
        'Fallback description'
      );
      expect(timelineElement.statusChip).toEqual({
        label: 'Rata Aggiunta',
        color: 'success'
      });
    });

    it('renders empty Typography when no description, no eventDescription, but has status', () => {
      const customTranslations = {
        'commons.DP_STATUS.DPI_ADDED': 'Rata Aggiunta'
      };

      i18nTestSetup(customTranslations);

      const registryStatusOnly: RegistryItem = {
        eventDateTime: '2025-05-16T10:45:30.987654Z',
        eventType: PaymentEventType.DPI_ADDED
      };

      const { result } = renderHook(() =>
        useTimelineData([registryStatusOnly])
      );

      const timelineElement = result.current[0];
      expect(timelineElement.content.props.children).toBeUndefined();
      expect(timelineElement.statusChip).toEqual({
        label: 'Rata Aggiunta',
        color: 'success'
      });
    });

    it('renders registry description for events without eventType', () => {
      const { result } = renderHook(() =>
        useTimelineData([mockRegistryWithoutEventType])
      );

      const timelineElement = result.current[0];
      expect(timelineElement.content.props.children).toBe(
        'Evento generico senza tipo'
      );
    });
  });
});

describe('getEventStatusColor', () => {
  it('returns correct colors for different event types', () => {
    expect(getEventStatusColor(PaymentEventType.DP_CREATED)).toBe('info');
    expect(getEventStatusColor(PaymentEventType.DP_UPDATED)).toBe('primary');
    expect(getEventStatusColor(PaymentEventType.DP_CANCELLED)).toBe('error');
    expect(getEventStatusColor(PaymentEventType.DPI_ADDED)).toBe('success');
    expect(getEventStatusColor(PaymentEventType.DPI_UPDATED)).toBe('info');
    expect(getEventStatusColor(PaymentEventType.DPI_CANCELLED)).toBe('error');
    expect(getEventStatusColor(PaymentEventType.DPI_EXPIRED)).toBe('error');
    expect(getEventStatusColor(PaymentEventType.DPI_REPORTED)).toBe('success');
    expect(getEventStatusColor(PaymentEventType.RT_RECEIVED)).toBe('success');
    expect(getEventStatusColor(PaymentEventType.SYNC_ERROR)).toBe('error');
    expect(getEventStatusColor(PaymentEventType.IO_NOTIFIED)).toBe('info');
    expect(
      getEventStatusColor(PaymentEventType.SEND_NOTIFICATION_CREATED)
    ).toBe('info');
    expect(getEventStatusColor(PaymentEventType.SEND_NOTIFICATION_ERROR)).toBe(
      'error'
    );
    expect(getEventStatusColor(PaymentEventType.SEND_NOTIFICATION_DATE)).toBe(
      'success'
    );
  });

  it('returns default color for unknown event types', () => {
    const unknownEventType = 'UNKNOWN_EVENT' as PaymentEventType;
    expect(getEventStatusColor(unknownEventType)).toBe('default');
  });
});

describe('getEventDisplayInfo', () => {
  beforeEach(() => {
    i18nTestSetup(mockTranslations);
  });

  it('returns correct display info when both description and status translations exist', () => {
    const mockT = (key: string) =>
      mockTranslations[key as keyof typeof mockTranslations] || key;

    const result = getEventDisplayInfo(PaymentEventType.DPI_ADDED, mockT);

    expect(result.hasDescription).toBe(true);
    expect(result.hasStatus).toBe(true);
    expect(result.description).toBe('Rata di pagamento aggiunta');
    expect(result.statusChip).toEqual({
      label: 'Rata Aggiunta',
      color: 'success'
    });
  });

  it('returns correct display info when only status translation exists', () => {
    const mockT = (key: string) => {
      if (key === 'commons.DP_STATUS.DPI_ADDED') return 'Rata Aggiunta';
      return key;
    };

    const result = getEventDisplayInfo(PaymentEventType.DPI_ADDED, mockT);

    expect(result.hasDescription).toBe(false);
    expect(result.hasStatus).toBe(true);
    expect(result.description).toBeUndefined();
    expect(result.statusChip).toEqual({
      label: 'Rata Aggiunta',
      color: 'success'
    });
  });

  it('returns correct display info when no translations exist', () => {
    const mockT = (key: string) => key;

    const result = getEventDisplayInfo(PaymentEventType.DPI_ADDED, mockT);

    expect(result.hasDescription).toBe(false);
    expect(result.hasStatus).toBe(false);
    expect(result.description).toBeUndefined();
    expect(result.statusChip).toBeUndefined();
  });

  it('returns correct display info when only description translation exists', () => {
    const mockT = (key: string) => {
      if (key === 'commons.DP_DESCRIPTION.DPI_ADDED')
        return 'Rata di pagamento aggiunta';
      return key;
    };

    const result = getEventDisplayInfo(PaymentEventType.DPI_ADDED, mockT);

    expect(result.hasDescription).toBe(true);
    expect(result.hasStatus).toBe(false);
    expect(result.description).toBe('Rata di pagamento aggiunta');
    expect(result.statusChip).toBeUndefined();
  });
});

describe('integration tests', () => {
  beforeEach(() => {
    i18nTestSetup(mockTranslations);
  });

  it('processes complex scenario with mixed registry types', () => {
    const complexRegistries: Array<RegistryItem> = [
      {
        eventDateTime: '2025-05-16T10:45:30.987654Z',
        eventType: PaymentEventType.DPI_ADDED,
        eventDescription: 'Rata aggiunta'
      },
      {
        eventDateTime: '2025-05-17T14:22:45.567890Z',
        eventDescription: 'Evento manuale senza tipo'
      },
      {
        eventDateTime: '2025-05-15T08:30:15.123456Z',
        eventType: PaymentEventType.DP_CREATED,
        eventDescription: 'Posizione creata'
      }
    ];

    const { result } = renderHook(() => useTimelineData(complexRegistries));

    expect(result.current).toHaveLength(3);

    expect(result.current[0].isFirst).toBe(true);
    expect(result.current[0].statusChip).toBeUndefined();

    expect(result.current[1].statusChip).toEqual({
      label: 'Rata Aggiunta',
      color: 'success'
    });

    expect(result.current[2].isLast).toBe(true);
    expect(result.current[2].statusChip).toEqual({
      label: 'Creata',
      color: 'info'
    });
  });

  it('handles real-world scenario with installment registries', () => {
    const installmentRegistries: Array<RegistryItem> = [
      {
        eventDateTime: '2025-05-16T10:45:30.987654Z',
        eventType: PaymentEventType.DPI_ADDED,
        eventDescription: 'Aggiunta prima rata di pagamento'
      },
      {
        eventDateTime: '2025-05-17T14:22:45.567890Z',
        eventType: PaymentEventType.IO_NOTIFIED,
        eventDescription: 'Notifica inviata tramite IO app'
      },
      {
        eventDateTime: '2025-05-20T11:47:38.345678Z',
        eventType: PaymentEventType.DPI_UPDATED,
        eventDescription: 'Modifica scadenza rata di pagamento'
      }
    ];

    const { result } = renderHook(() => useTimelineData(installmentRegistries));

    expect(result.current).toHaveLength(3);

    const sortedDates = result.current.map((el) => el.date.getTime());
    expect(sortedDates[0]).toBeGreaterThan(sortedDates[1]);
    expect(sortedDates[1]).toBeGreaterThan(sortedDates[2]);

    const elementsWithTranslations = result.current.filter(
      (el) => el.statusChip !== undefined
    );

    expect(elementsWithTranslations).toHaveLength(2);

    elementsWithTranslations.forEach((element) => {
      expect(element.statusChip).toBeDefined();
      expect(element.statusChip?.color).toBeDefined();
      expect(element.statusChip?.label).toBeDefined();
    });
  });

  it('handles edge case with all registries having same timestamp', () => {
    const sameTimestampRegistries: Array<RegistryItem> = [
      {
        eventDateTime: '2025-05-16T10:45:30.987654Z',
        eventType: PaymentEventType.DPI_ADDED,
        eventDescription: 'Primo evento'
      },
      {
        eventDateTime: '2025-05-16T10:45:30.987654Z',
        eventType: PaymentEventType.DPI_UPDATED,
        eventDescription: 'Secondo evento'
      },
      {
        eventDateTime: '2025-05-16T10:45:30.987654Z',
        eventType: PaymentEventType.DPI_REPORTED,
        eventDescription: 'Terzo evento'
      }
    ];

    const { result } = renderHook(() =>
      useTimelineData(sameTimestampRegistries)
    );

    expect(result.current).toHaveLength(3);

    const uniqueDates = new Set(result.current.map((el) => el.date.getTime()));
    expect(uniqueDates.size).toBe(1);

    expect(result.current[0].isFirst).toBe(true);
    expect(result.current[2].isLast).toBe(true);
  });

  it('preserves original order when dates are missing', () => {
    const registriesWithoutDates: Array<RegistryItem> = [
      {
        eventType: PaymentEventType.DPI_ADDED,
        eventDescription: 'Primo senza data'
      },
      {
        eventType: PaymentEventType.DPI_UPDATED,
        eventDescription: 'Secondo senza data'
      }
    ];

    const { result } = renderHook(() =>
      useTimelineData(registriesWithoutDates)
    );

    expect(result.current).toHaveLength(2);

    const dates = result.current.map((el) => el.date.getTime());
    expect(Math.abs(dates[0] - dates[1])).toBeLessThan(100);
  });
});
