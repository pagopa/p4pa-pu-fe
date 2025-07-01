/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../__tests__/renderers';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { RegistryDetailPage } from './RegistryDetailPage';
import * as registryDetailHook from '../../api/registryDetail';
import {
  RegistrySilEventType,
  RegistryEventSubType,
  RegistryOutcome
} from '../../../generated/data-contracts';

vi.mock('../../api/registryDetail');

vi.mock('./registryDetailConfig', () => ({
  mapRegistryToDetailSections: vi.fn((registry, _t) => [
    {
      title: 'Event Information',
      data: [
        { label: 'Event Type', value: registry.eventType },
        { label: 'Date Time', value: registry.dateTime }
      ]
    },
    {
      title: 'Registry Details',
      data: [
        { label: 'Registry ID', value: registry.registryId },
        { label: 'Trace ID', value: registry.traceId }
      ]
    },
    {
      title: 'Specific Parameters',
      data: [
        { label: 'IUV', value: registry.iuv },
        { label: 'Outcome', value: registry.outcome }
      ]
    }
  ])
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({
      registryId: 'test-registry-id',
      registryType: 'sil'
    })
  };
});

vi.mock('../../store/GlobalStore', () => ({
  useStore: () => ({
    state: {
      organizationId: 123,
      APP_STATE: { loading: false, customBreadcrumbsItems: [] }
    },
    setState: vi.fn()
  }),
  StoreProvider: ({ children }: any) => children
}));

describe('RegistryDetailPage', () => {
  const mockUseRegistry = vi.mocked(registryDetailHook.useRegistry);

  const mockSilRegistry = {
    registryId: 'test-registry-id',
    dateTime: '2024-01-15T10:30:00',
    traceId: 'trace-123',
    brokerFiscalCode: '12345678901',
    orgFiscalCode: '12345678901',
    iuv: 'IUV123456789',
    nav: 'NAV123',
    eventType: RegistrySilEventType.PaaSILImportaDovuto,
    eventSubType: RegistryEventSubType.REQ,
    requestorId: 'requestor-123',
    grantorId: 'grantor-456',
    outcome: RegistryOutcome.OK,
    body: 'mock body content'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    i18nTestSetup({
      'registry.detail.eventDetailTitle': 'Event Detail',
      'registry.detail.noOrganizationError': 'No organization selected',
      'registry.detail.invalidRegistryTypeError': 'Invalid registry type',
      'registry.detail.loadError': 'Error loading registry data'
    });
  });

  it('should render registry details when data is available', async () => {
    mockUseRegistry.mockReturnValue({
      data: mockSilRegistry,
      isError: false,
      error: null
    } as any);

    render(<RegistryDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId('detail-title')).toBeInTheDocument();
      expect(screen.getByText('Event Detail')).toBeInTheDocument();
    });
  });

  it('should call useRegistry with correct parameters', () => {
    mockUseRegistry.mockReturnValue({
      data: mockSilRegistry,
      isError: false,
      error: null
    } as any);

    render(<RegistryDetailPage />);

    expect(mockUseRegistry).toHaveBeenCalledWith(
      'sil',
      123,
      'test-registry-id',
      true
    );
  });
});
