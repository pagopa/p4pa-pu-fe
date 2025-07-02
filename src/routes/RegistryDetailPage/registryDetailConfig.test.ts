/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/no-nested-functions */
import { describe, expect, it, vi } from 'vitest';
import {
  isPagoPaRegistry,
  isSilRegistry,
  mapRegistryToDetailSections
} from './registryDetailConfig';
import {
  PagoPaRegistryDTO,
  SilRegistryDTO,
  RegistryEventCategory,
  RegistryPagoPaEventType,
  RegistryEventSubType,
  RegistryOutcome,
  RegistrySilEventType
} from '../../../generated/data-contracts';
import * as formatters from '../../utils/formatters';

vi.mock('../../utils/formatters', () => ({
  formatDateTime: vi.fn()
}));

describe('registryDetailConfig', () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'registry.detail.eventType': 'Tipo Evento',
      'registry.detail.eventSubType': 'Sotto Tipo Evento',
      'registry.detail.eventCategory': 'Categoria Evento',
      'registry.detail.outcome': 'Esito',
      'registry.detail.dateTime': 'Data e Ora',
      'registry.detail.registryId': 'ID Registro',
      'commons.iuv': 'IUV',
      'commons.nav': 'NAV',
      'registry.detail.paymentChannel': 'Canale di Pagamento',
      'registry.detail.intermediateStationPA': 'Stazione Intermedia PA',
      'registry.detail.noInterfaceParams': 'Nessun Parametro',
      'registry.detail.noInterfaceParamsDescription':
        'Nessun parametro di interfaccia disponibile',
      'registry.detail.event': 'Evento',
      'registry.detail.details': 'Dettagli',
      'registry.detail.interfaceSpecificParamsTitle':
        'Parametri Specifici Interfaccia'
    };
    return translations[key] || key;
  });

  const mockPagoPaRegistry: PagoPaRegistryDTO = {
    registryId: 'test-pagopa-123',
    dateTime: '2024-01-15T10:30:00Z',
    traceId: 'trace-123',
    orgFiscalCode: '12345678901',
    iuv: 'iuv-test-123',
    nav: 'nav-test-456',
    eventCategory: RegistryEventCategory.INTERFACCIA,
    eventType: RegistryPagoPaEventType.ACANewDebtPosition,
    eventSubType: RegistryEventSubType.REQ,
    requestorId: 'requestor-123',
    grantorId: 'grantor-456',
    outcome: RegistryOutcome.OK,
    pspChannelId: 'channel-789',
    brokerStationId: 'station-101',
    body: '{"test": "data"}'
  };

  const mockSilRegistry: SilRegistryDTO = {
    registryId: 'test-sil-456',
    dateTime: '2024-01-15T14:45:00Z',
    traceId: 'trace-456',
    brokerFiscalCode: '98765432109',
    orgFiscalCode: '12345678901',
    iuv: 'iuv-sil-789',
    nav: 'nav-sil-012',
    eventType: RegistrySilEventType.PTDPPaaSILImportaDovuto,
    eventSubType: RegistryEventSubType.RESP,
    requestorId: 'sil-requestor-789',
    grantorId: 'sil-grantor-012',
    outcome: RegistryOutcome.KO,
    body: '{"sil": "data", "status": "error"}'
  };

  describe('Type Guards', () => {
    describe('isPagoPaRegistry', () => {
      it('should return true for PagoPa registry', () => {
        expect(isPagoPaRegistry(mockPagoPaRegistry)).toBe(true);
      });

      it('should return false for SIL registry', () => {
        expect(isPagoPaRegistry(mockSilRegistry)).toBe(false);
      });

      it('should correctly narrow the type for PagoPa registry', () => {
        if (isPagoPaRegistry(mockPagoPaRegistry)) {
          expect(mockPagoPaRegistry.eventCategory).toBeDefined();
          expect(mockPagoPaRegistry.pspChannelId).toBeDefined();
          expect(mockPagoPaRegistry.brokerStationId).toBeDefined();
        }
      });

      it('should handle edge cases with minimal data', () => {
        const minimalPagoPaRegistry = {
          eventCategory: RegistryEventCategory.INTERNO,
          eventType: RegistryPagoPaEventType.GPDUpdatePosition,
          eventSubType: RegistryEventSubType.REQ,
          registryId: 'test',
          dateTime: '2024-01-01T00:00:00Z',
          traceId: 'trace',
          orgFiscalCode: '12345678901',
          requestorId: 'req',
          grantorId: 'grant',
          outcome: RegistryOutcome.OK
        } as PagoPaRegistryDTO;

        expect(isPagoPaRegistry(minimalPagoPaRegistry)).toBe(true);
      });
    });

    describe('isSilRegistry', () => {
      it('should return true for SIL registry', () => {
        expect(isSilRegistry(mockSilRegistry)).toBe(true);
      });

      it('should return false for PagoPa registry', () => {
        expect(isSilRegistry(mockPagoPaRegistry)).toBe(false);
      });

      it('should correctly narrow the type for SIL registry', () => {
        if (isSilRegistry(mockSilRegistry)) {
          expect(mockSilRegistry.brokerFiscalCode).toBeDefined();
        }
      });

      it('should handle edge cases with minimal data', () => {
        const minimalSilRegistry = {
          brokerFiscalCode: '98765432109',
          eventType: RegistrySilEventType.PTDPPaaSILAutorizzaImportFlusso,
          eventSubType: RegistryEventSubType.REQ,
          registryId: 'test',
          dateTime: '2024-01-01T00:00:00Z',
          traceId: 'trace',
          orgFiscalCode: '12345678901',
          requestorId: 'req',
          grantorId: 'grant',
          outcome: RegistryOutcome.OK
        } as SilRegistryDTO;

        expect(isSilRegistry(minimalSilRegistry)).toBe(true);
      });
    });
  });

  describe('mapRegistryToDetailSections', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.mocked(formatters.formatDateTime).mockReturnValue('15/01/2024 10:30');
    });

    describe('PagoPa Registry Mapping', () => {
      it('should map PagoPa registry to correct detail sections', () => {
        const result = mapRegistryToDetailSections(mockPagoPaRegistry, mockT);

        expect(result).toHaveLength(3);
        expect(result[0].title?.label).toBe('Evento');
        expect(result[1].title?.label).toBe('Dettagli');
        expect(result[2].title?.label).toBe('Parametri Specifici Interfaccia');
      });

      it('should include eventCategory for PagoPa registry', () => {
        const result = mapRegistryToDetailSections(mockPagoPaRegistry, mockT);

        const eventSection = result[0];
        const eventCategoryField = eventSection.data.find(
          (item) => item.label === 'Categoria Evento'
        );

        expect(eventCategoryField).toBeDefined();
        expect(eventCategoryField?.value).toBe(
          RegistryEventCategory.INTERFACCIA
        );
      });

      it('should include PagoPa-specific fields in details section', () => {
        const result = mapRegistryToDetailSections(mockPagoPaRegistry, mockT);

        const detailsSection = result[1];
        const paymentChannelField = detailsSection.data.find(
          (item) => item.label === 'Canale di Pagamento'
        );
        const stationField = detailsSection.data.find(
          (item) => item.label === 'Stazione Intermedia PA'
        );

        expect(paymentChannelField).toBeDefined();
        expect(paymentChannelField?.value).toBe('channel-789');
        expect(stationField).toBeDefined();
        expect(stationField?.value).toBe('station-101');
      });

      it('should call formatDateTime for dateTime field', () => {
        mapRegistryToDetailSections(mockPagoPaRegistry, mockT);

        expect(formatters.formatDateTime).toHaveBeenCalledWith(
          '2024-01-15T10:30:00Z'
        );
      });

      it('should create ExpandableCard for body content', () => {
        const result = mapRegistryToDetailSections(mockPagoPaRegistry, mockT);

        const interfaceSection = result[2];
        const bodyField = interfaceSection.data[0];

        expect(bodyField.childrenComponent).toBeDefined();
        expect(bodyField.value).toBe('{"test": "data"}');
      });
    });

    describe('SIL Registry Mapping', () => {
      it('should map SIL registry to correct detail sections', () => {
        const result = mapRegistryToDetailSections(mockSilRegistry, mockT);

        expect(result).toHaveLength(3);
        expect(result[0].title?.label).toBe('Evento');
        expect(result[1].title?.label).toBe('Dettagli');
        expect(result[2].title?.label).toBe('Parametri Specifici Interfaccia');
      });

      it('should NOT include eventCategory for SIL registry', () => {
        const result = mapRegistryToDetailSections(mockSilRegistry, mockT);

        const eventSection = result[0];
        const eventCategoryField = eventSection.data.find(
          (item) => item.label === 'Categoria Evento'
        );

        expect(eventCategoryField).toBeUndefined();
      });

      it('should NOT include PagoPa-specific fields for SIL registry', () => {
        const result = mapRegistryToDetailSections(mockSilRegistry, mockT);

        const detailsSection = result[1];
        const paymentChannelField = detailsSection.data.find(
          (item) => item.label === 'Canale di Pagamento'
        );
        const stationField = detailsSection.data.find(
          (item) => item.label === 'Stazione Intermedia PA'
        );

        expect(paymentChannelField).toBeUndefined();
        expect(stationField).toBeUndefined();
      });

      it('should include common fields for SIL registry', () => {
        const result = mapRegistryToDetailSections(mockSilRegistry, mockT);

        const eventSection = result[0];
        const detailsSection = result[1];

        expect(eventSection.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              label: 'Tipo Evento',
              value: RegistrySilEventType.PTDPPaaSILImportaDovuto
            }),
            expect.objectContaining({
              label: 'Sotto Tipo Evento',
              value: RegistryEventSubType.RESP
            }),
            expect.objectContaining({
              label: 'Esito',
              value: RegistryOutcome.KO
            })
          ])
        );

        expect(detailsSection.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              label: 'ID Registro',
              value: 'test-sil-456'
            }),
            expect.objectContaining({ label: 'IUV', value: 'iuv-sil-789' }),
            expect.objectContaining({ label: 'NAV', value: 'nav-sil-012' })
          ])
        );
      });
    });

    describe('Body Content Handling', () => {
      it('should handle string body content', () => {
        const registryWithStringBody = {
          ...mockPagoPaRegistry,
          body: '{"stringified": "json"}'
        };

        const result = mapRegistryToDetailSections(
          registryWithStringBody,
          mockT
        );
        const interfaceSection = result[2];

        expect(interfaceSection.data[0].value).toBe('{"stringified": "json"}');
      });

      it('should handle object body content', () => {
        const objectBody = { test: 'object', nested: { value: 123 } };
        const registryWithObjectBody = {
          ...mockPagoPaRegistry,
          body: JSON.stringify(objectBody)
        };

        const result = mapRegistryToDetailSections(
          registryWithObjectBody,
          mockT
        );
        const interfaceSection = result[2];

        expect(interfaceSection.data[0].value).toBe(JSON.stringify(objectBody));
      });

      it('should handle missing body content', () => {
        const registryWithoutBody = {
          ...mockPagoPaRegistry
        };
        delete (registryWithoutBody as any).body;

        const result = mapRegistryToDetailSections(registryWithoutBody, mockT);
        const interfaceSection = result[2];

        expect(interfaceSection.data[0].label).toBe('Nessun Parametro');
        expect(interfaceSection.data[0].value).toBe(
          'Nessun parametro di interfaccia disponibile'
        );
        expect(interfaceSection.data[0].childrenComponent).toBeUndefined();
      });

      it('should handle empty string body content', () => {
        const registryWithEmptyBody = {
          ...mockPagoPaRegistry,
          body: ''
        };

        const result = mapRegistryToDetailSections(
          registryWithEmptyBody,
          mockT
        );
        const interfaceSection = result[2];

        expect(interfaceSection.data[0].label).toBe('Nessun Parametro');
        expect(interfaceSection.data[0].value).toBe(
          'Nessun parametro di interfaccia disponibile'
        );
      });
    });

    describe('Edge Cases', () => {
      it('should handle missing optional fields gracefully', () => {
        const minimalRegistry: PagoPaRegistryDTO = {
          registryId: 'minimal-test',
          dateTime: '2024-01-01T00:00:00Z',
          traceId: 'trace-minimal',
          orgFiscalCode: '12345678901',
          eventCategory: RegistryEventCategory.INTERNO,
          eventType: RegistryPagoPaEventType.PaForNodePaGetPaymentV2,
          eventSubType: RegistryEventSubType.REQ,
          requestorId: 'req-minimal',
          grantorId: 'grant-minimal',
          outcome: RegistryOutcome.OK
        };

        const result = mapRegistryToDetailSections(minimalRegistry, mockT);

        expect(result).toHaveLength(3);

        const detailsSection = result[1];
        const iuvField = detailsSection.data.find(
          (item) => item.label === 'IUV'
        );
        const navField = detailsSection.data.find(
          (item) => item.label === 'NAV'
        );

        expect(iuvField?.value).toBeUndefined();
        expect(navField?.value).toBeUndefined();
      });

      it('should handle missing dateTime gracefully', () => {
        const registryWithoutDateTime = {
          ...mockPagoPaRegistry,
          dateTime: null as any
        };

        const result = mapRegistryToDetailSections(
          registryWithoutDateTime,
          mockT
        );
        const detailsSection = result[1];
        const dateTimeField = detailsSection.data.find(
          (item) => item.label === 'Data e Ora'
        );

        expect(dateTimeField?.value).toBe('');
        expect(formatters.formatDateTime).not.toHaveBeenCalled();
      });

      it('should preserve section structure and properties', () => {
        const result = mapRegistryToDetailSections(mockPagoPaRegistry, mockT);

        expect(result[0]).toEqual(
          expect.objectContaining({
            title: expect.objectContaining({
              label: 'Evento',
              variant: 'overline'
            }),
            inline: true
          })
        );

        expect(result[1]).toEqual(
          expect.objectContaining({
            title: expect.objectContaining({
              label: 'Dettagli',
              variant: 'overline'
            }),
            inline: true
          })
        );

        expect(result[2]).toEqual(
          expect.objectContaining({
            title: expect.objectContaining({
              label: 'Parametri Specifici Interfaccia',
              variant: 'overline'
            }),
            inline: false
          })
        );
      });
    });
  });
});
