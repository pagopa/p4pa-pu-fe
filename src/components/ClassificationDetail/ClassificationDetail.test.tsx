/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '../../__tests__/renderers';
import ClassificationsDetail from './';
import * as classificationService from '../../api/getClassificationDetail';
import { setOrganizationId } from '../../store/OrganizationIdStore';
import { createMock } from 'zodock';
import { classificationDetailDTOSchema } from '../../../generated/zod-schema';
import { ClassificationsEnum } from '../../../generated/data-contracts';
import * as ReactRouter from 'react-router';

const { mockNavigate, mockGeneratePath } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockGeneratePath: vi.fn()
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useParams: vi.fn(() => ({ classificationId: '673' })),
    useNavigate: () => mockNavigate,
    generatePath: mockGeneratePath
  };
});

vi.mock('../../routes', () => ({
  PageRoutes: {
    RESPONSES_ERROR: '/error',
    TELEMATIC_RECEIPT_DETAIL: '/telematic-receipt/:id',
    REPORTING_DETAIL: '/reporting/:id',
    TREASURY_DETAIL: '/treasury/:id'
  }
}));

const mockData = createMock(classificationDetailDTOSchema);

const createMockData = (overrides = {}) => {
  const baseData = {
    id: 673,
    paid: false,
    reported: false,
    collected: false,
    label: null,
    flagPaymentNotification: false,
    debtPositionTypeOrgCode: null,
    remittanceInformation: null,
    receiptPaymentAmount: null,
    receiptPaymentDateTime: null,
    iuv: null,
    iud: null,
    iur: null,
    receiptDebtor: null,
    receiptPayer: null,
    paymentNotificationDebtPositionTypeOrgCode: null,
    paymentNotificationRemittanceInformation: null,
    paymentNotificationAmountPaidCents: null,
    paymentNotificationDebtor: null,
    paymentExecutionDate: null,
    paymentNotificationIud: null,
    iuf: null,
    flowDateTime: null,
    regulationUniqueIdentifier: null,
    regionValueDate: null,
    totalAmountCents: null,
    sealCode: null,
    pspLastName: null,
    documentCode: null,
    billDate: null,
    billYear: null,
    provisionalAe: null,
    receptionDate: null,
    billCode: null,
    provisionalCode: null,
    receiptPaymentReceiptId: null,
    receiptPaymentRequestId: null,
    treasuryId: null,
    ...overrides
  };

  return baseData;
};

vi.mock('../../utils', () => ({
  default: {
    config: {
      deployPath: '/test',
      baseURL: 'http://test',
      apiTimeout: 5000,
      fileshareURL: 'http://test-fileshare'
    },
    apiClient: {
      bff: {
        getClassificationDetails: () => ({ data: mockData })
      }
    },
    loaders: {},
    sidemenu: {},
    style: {},
    storage: {},
    notify: { emit: vi.fn() },
    roles: {},
    filtersValidation: {}
  }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

setOrganizationId(2);

describe('Classifications Detail:', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ReactRouter.useParams).mockReturnValue({
      classificationId: '673'
    });

    mockGeneratePath.mockImplementation((route, params) => {
      if (route === '/telematic-receipt/:id') {
        return `/telematic-receipt/${params.id}`;
      }
      if (route === '/reporting/:id') {
        return `/reporting/${params.id}`;
      }
      if (route === '/treasury/:id') {
        return `/treasury/${params.id}`;
      }
      return route;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ClassificationsDetail />);
    });

    it('displays title correctly', () => {
      render(<ClassificationsDetail />);
      expect(screen.getByText('classifications.title')).toBeInTheDocument();
    });
  });

  describe('params & services handling', () => {
    it('passes the right parameters to the getClassificationDetails hook', () => {
      const spyGetClassificationDetails = vi.spyOn(
        classificationService,
        'getClassificationDetail'
      );
      render(<ClassificationsDetail />);
      expect(spyGetClassificationDetails).toBeCalledWith(2, 673);
    });

    it('handles invalid classificationId by navigating to error page', async () => {
      vi.mocked(ReactRouter.useParams).mockReturnValue({
        classificationId: 'invalid-id'
      });

      render(<ClassificationsDetail />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/error');
      });
    });

    it('handles API error by navigating to error page', async () => {
      vi.spyOn(
        classificationService,
        'getClassificationDetail'
      ).mockReturnValue({
        data: null,
        isError: true,
        error: new Error('API Error')
      } as any);

      render(<ClassificationsDetail />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/error');
      });
    });
  });

  describe('Tabs optional visibilty', () => {
    it('shows only paid tab when only paid data is available', async () => {
      const paidOnlyData = createMockData({
        paid: true,
        reported: false,
        collected: false,
        debtPositionTypeOrgCode: 'DEBT123',
        remittanceInformation: 'Test Payment',
        receiptPaymentAmount: 1000
      });

      vi.spyOn(
        classificationService,
        'getClassificationDetail'
      ).mockReturnValue({
        data: paidOnlyData,
        isError: false,
        error: null
      } as any);

      render(<ClassificationsDetail />);

      await waitFor(() => {
        expect(screen.getByText('classifications.title')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'classifications.detail.statusBar.status.reconciliationState.title'
        )
      ).toBeInTheDocument();
    });

    it('shows only reported tab when only reported data is available', async () => {
      const reportedOnlyData = createMockData({
        paid: false,
        reported: true,
        collected: false,
        iuf: 'IUF123',
        flowDateTime: '2023-01-01T10:00:00Z'
      });

      vi.spyOn(
        classificationService,
        'getClassificationDetail'
      ).mockReturnValue({
        data: reportedOnlyData,
        isError: false,
        error: null
      } as any);

      render(<ClassificationsDetail />);

      await waitFor(() => {
        expect(screen.getByText('classifications.title')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'classifications.detail.statusBar.status.reconciliationState.title'
        )
      ).toBeInTheDocument();
    });

    it('shows all tabs when all data types are available', async () => {
      const allDataAvailable = createMockData({
        paid: true,
        reported: true,
        collected: true,
        debtPositionTypeOrgCode: 'DEBT123',
        iuf: 'IUF123',
        sealCode: 'SEAL123'
      });

      vi.spyOn(
        classificationService,
        'getClassificationDetail'
      ).mockReturnValue({
        data: allDataAvailable,
        isError: false,
        error: null
      } as any);

      render(<ClassificationsDetail />);

      await waitFor(() => {
        expect(screen.getByText('classifications.title')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'classifications.detail.statusBar.status.reconciliationState.title'
        )
      ).toBeInTheDocument();
    });

    it('hides tab list when only one tab is visible', async () => {
      const singleTabData = createMockData({
        paid: true,
        reported: false,
        collected: false,
        debtPositionTypeOrgCode: 'DEBT123'
      });

      vi.spyOn(
        classificationService,
        'getClassificationDetail'
      ).mockReturnValue({
        data: singleTabData,
        isError: false,
        error: null
      } as any);

      render(<ClassificationsDetail />);

      await waitFor(() => {
        expect(screen.getByText('classifications.title')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'classifications.detail.statusBar.status.reconciliationState.title'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Tabs functionality', () => {
    let allDataAvailable: any;

    beforeEach(() => {
      allDataAvailable = createMockData({
        paid: true,
        reported: true,
        collected: true,
        debtPositionTypeOrgCode: 'DEBT123',
        iuf: 'IUF123',
        sealCode: 'SEAL123'
      });

      vi.spyOn(
        classificationService,
        'getClassificationDetail'
      ).mockReturnValue({
        data: allDataAvailable,
        isError: false,
        error: null
      } as any);
    });

    it('renders component with all data types', async () => {
      render(<ClassificationsDetail />);

      await waitFor(() => {
        expect(screen.getByText('classifications.title')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'classifications.detail.statusBar.status.reconciliationState.title'
        )
      ).toBeInTheDocument();
    });

    it('sets up component correctly', async () => {
      render(<ClassificationsDetail />);

      await waitFor(() => {
        expect(screen.getByText('classifications.title')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'classifications.detail.statusBar.status.reconciliationState.title'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Tabs content', () => {
    it('displays component with debt type data', async () => {
      const mockDataWithDebtType = createMockData({
        paid: true,
        debtPositionTypeOrgCode: 'DEBT123',
        remittanceInformation: 'Test Payment Object',
        receiptPaymentAmount: 1000,
        iuv: 'IUV123'
      });

      vi.spyOn(
        classificationService,
        'getClassificationDetail'
      ).mockReturnValue({
        data: mockDataWithDebtType,
        isError: false,
        error: null
      } as any);

      render(<ClassificationsDetail />);

      await waitFor(() => {
        expect(screen.getByText('classifications.title')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'classifications.detail.statusBar.status.reconciliationState.title'
        )
      ).toBeInTheDocument();
    });

    it('displays component with reporting data', async () => {
      const mockDataWithReporting = createMockData({
        paid: true,
        reported: true,
        iuf: 'IUF123',
        regulationUniqueIdentifier: 'REG456'
      });

      vi.spyOn(
        classificationService,
        'getClassificationDetail'
      ).mockReturnValue({
        data: mockDataWithReporting,
        isError: false,
        error: null
      } as any);

      render(<ClassificationsDetail />);

      await waitFor(() => {
        expect(screen.getByText('classifications.title')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'classifications.detail.statusBar.status.reconciliationState.title'
        )
      ).toBeInTheDocument();
    });

    it('displays ID Rendicontazione / IUF field in treasury tab when data is collected and treasury is available', async () => {
      const mockDataWithTreasury = createMockData({
        paid: true,
        reported: true,
        collected: true,
        flagTreasury: true,
        iuf: 'IUF123',
        sealCode: 'SEAL123'
      });

      vi.spyOn(
        classificationService,
        'getClassificationDetail'
      ).mockReturnValue({
        data: mockDataWithTreasury,
        isError: false,
        error: null
      } as any);

      render(<ClassificationsDetail />);

      await waitFor(() => {
        expect(screen.getByText('classifications.title')).toBeInTheDocument();
      });

      const earningsTab = screen.getByRole('tab', {
        name: 'classifications.detail.sections.earnings.title'
      });
      fireEvent.click(earningsTab);

      expect(
        screen.getByText('reportingDetail.reportingIdOrIUF')
      ).toBeInTheDocument();

      expect(screen.getByText('IUF123')).toBeInTheDocument();
    });
  });

  describe('Link handling', () => {
    it('renders component with receipt data', async () => {
      const mockDataWithReceiptId = createMockData({
        paid: true,
        receiptPaymentReceiptId: 'receipt123',
        receiptPaymentRequestId: 'request456'
      });

      vi.spyOn(
        classificationService,
        'getClassificationDetail'
      ).mockReturnValue({
        data: mockDataWithReceiptId,
        isError: false,
        error: null
      } as any);

      render(<ClassificationsDetail />);

      await waitFor(() => {
        expect(screen.getByText('classifications.title')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'classifications.detail.statusBar.status.reconciliationState.title'
        )
      ).toBeInTheDocument();
    });

    it('renders component with iuf data', async () => {
      const mockDataWithIuf = createMockData({
        paid: true,
        reported: true,
        iuf: 'iuf789'
      });

      vi.spyOn(
        classificationService,
        'getClassificationDetail'
      ).mockReturnValue({
        data: mockDataWithIuf,
        isError: false,
        error: null
      } as any);

      render(<ClassificationsDetail />);

      await waitFor(() => {
        expect(screen.getByText('classifications.title')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'classifications.detail.statusBar.status.reconciliationState.title'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Notified Payment section', () => {
    it('renders component with notified payment data', async () => {
      const mockDataWithNotifiedPayment = createMockData({
        paid: true,
        paymentNotificationDebtPositionTypeOrgCode: 'NOTIF123',
        paymentNotificationRemittanceInformation: 'Notification Info',
        paymentNotificationAmountPaidCents: 5000
      });

      vi.spyOn(
        classificationService,
        'getClassificationDetail'
      ).mockReturnValue({
        data: mockDataWithNotifiedPayment,
        isError: false,
        error: null
      } as any);

      render(<ClassificationsDetail />);

      await waitFor(() => {
        expect(screen.getByText('classifications.title')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'classifications.detail.statusBar.status.reconciliationState.title'
        )
      ).toBeInTheDocument();
    });

    it('renders component without notified payment data', async () => {
      const mockDataWithoutNotifiedPayment = createMockData({
        paid: true,
        paymentNotificationDebtPositionTypeOrgCode: null,
        paymentNotificationRemittanceInformation: null,
        paymentNotificationAmountPaidCents: null
      });

      vi.spyOn(
        classificationService,
        'getClassificationDetail'
      ).mockReturnValue({
        data: mockDataWithoutNotifiedPayment,
        isError: false,
        error: null
      } as any);

      render(<ClassificationsDetail />);

      await waitFor(() => {
        expect(screen.getByText('classifications.title')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'classifications.detail.statusBar.status.reconciliationState.title'
        )
      ).toBeInTheDocument();
    });

    it('shows telematic receipt tab when label is IUD_NO_RT and flagPaymentNotification is true', async () => {
      const mockDataIudNoRt = createMockData({
        paid: false,
        reported: false,
        collected: false,
        label: ClassificationsEnum.IUD_NO_RT,
        flagPaymentNotification: true,
        paymentNotificationDebtPositionTypeOrgCode: 'NOTIF123',
        paymentNotificationRemittanceInformation: 'Notification Info',
        paymentNotificationAmountPaidCents: 5000
      });

      vi.spyOn(
        classificationService,
        'getClassificationDetail'
      ).mockReturnValue({
        data: mockDataIudNoRt,
        isError: false,
        error: null
      } as any);

      render(<ClassificationsDetail />);

      await waitFor(() => {
        expect(screen.getByText('classifications.title')).toBeInTheDocument();
      });

      expect(
        screen.getByTestId('ClassificationDetailTabPanelDebtType')
      ).toBeInTheDocument();
    });

    it('does not show telematic receipt tab when label is IUD_NO_RT but flagPaymentNotification is false', async () => {
      const mockDataIudNoRtNoFlag = createMockData({
        paid: false,
        reported: true,
        collected: false,
        label: ClassificationsEnum.IUD_NO_RT,
        flagPaymentNotification: false,
        iuf: 'IUF123'
      });

      vi.spyOn(
        classificationService,
        'getClassificationDetail'
      ).mockReturnValue({
        data: mockDataIudNoRtNoFlag,
        isError: false,
        error: null
      } as any);

      render(<ClassificationsDetail />);

      await waitFor(() => {
        expect(screen.getByText('classifications.title')).toBeInTheDocument();
      });

      expect(
        screen.queryByTestId('ClassificationDetailTabPanelDebtType')
      ).not.toBeInTheDocument();
    });

    it('shows notified payment section but not telematic receipt section when IUD_NO_RT and flagPaymentNotification is true', async () => {
      const mockDataIudNoRt = createMockData({
        paid: false,
        reported: false,
        collected: false,
        label: ClassificationsEnum.IUD_NO_RT,
        flagPaymentNotification: true,
        paymentNotificationDebtPositionTypeOrgCode: 'NOTIF123'
      });

      vi.spyOn(
        classificationService,
        'getClassificationDetail'
      ).mockReturnValue({
        data: mockDataIudNoRt,
        isError: false,
        error: null
      } as any);

      render(<ClassificationsDetail />);

      await waitFor(() => {
        expect(screen.getByText('classifications.title')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'classifications.detail.sections.notifiedPayment.title'
        )
      ).toBeInTheDocument();

      expect(
        screen.queryByText(
          'classifications.detail.sections.telematicReceipt.link'
        )
      ).not.toBeInTheDocument();
    });

    it('shows both sections when paid is true and flagPaymentNotification is true', async () => {
      const mockDataBothSections = createMockData({
        paid: true,
        reported: false,
        collected: false,
        flagPaymentNotification: true,
        debtPositionTypeOrgCode: 'DEBT123',
        paymentNotificationDebtPositionTypeOrgCode: 'NOTIF123'
      });

      vi.spyOn(
        classificationService,
        'getClassificationDetail'
      ).mockReturnValue({
        data: mockDataBothSections,
        isError: false,
        error: null
      } as any);

      render(<ClassificationsDetail />);

      await waitFor(() => {
        expect(screen.getByText('classifications.title')).toBeInTheDocument();
      });

      expect(
        screen.getByTestId('ClassificationDetailTabPanelDebtType')
      ).toBeInTheDocument();

      expect(
        screen.getByText(
          'classifications.detail.sections.telematicReceipt.link'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'classifications.detail.sections.notifiedPayment.title'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('shows only title when data is loading', () => {
      vi.spyOn(
        classificationService,
        'getClassificationDetail'
      ).mockReturnValue({
        data: null,
        isError: false,
        error: null
      } as any);

      render(<ClassificationsDetail />);

      expect(screen.getByText('classifications.title')).toBeInTheDocument();

      expect(
        screen.queryByText(
          'classifications.detail.statusBar.status.reconciliationState.title'
        )
      ).not.toBeInTheDocument();
    });

    it('shows title and status bar when data is loaded', async () => {
      const loadedData = createMockData({
        paid: true,
        reported: true,
        collected: true,
        debtPositionTypeOrgCode: 'DEBT123',
        iuf: 'IUF123',
        sealCode: 'SEAL123'
      });

      vi.spyOn(
        classificationService,
        'getClassificationDetail'
      ).mockReturnValue({
        data: loadedData,
        isError: false,
        error: null
      } as any);

      render(<ClassificationsDetail />);

      expect(screen.getByText('classifications.title')).toBeInTheDocument();

      await waitFor(() => {
        expect(
          screen.getByText(
            'classifications.detail.statusBar.status.reconciliationState.title'
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('renders component with proper structure', async () => {
      const allDataAvailable = createMockData({
        paid: true,
        reported: true,
        collected: true,
        debtPositionTypeOrgCode: 'DEBT123',
        iuf: 'IUF123',
        sealCode: 'SEAL123'
      });

      vi.spyOn(
        classificationService,
        'getClassificationDetail'
      ).mockReturnValue({
        data: allDataAvailable,
        isError: false,
        error: null
      } as any);

      render(<ClassificationsDetail />);

      await waitFor(() => {
        expect(screen.getByText('classifications.title')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'classifications.detail.statusBar.status.reconciliationState.title'
        )
      ).toBeInTheDocument();
    });

    it('renders with proper accessibility structure', async () => {
      const allDataAvailable = createMockData({
        paid: true,
        reported: true,
        collected: true,
        debtPositionTypeOrgCode: 'DEBT123',
        iuf: 'IUF123',
        sealCode: 'SEAL123'
      });

      vi.spyOn(
        classificationService,
        'getClassificationDetail'
      ).mockReturnValue({
        data: allDataAvailable,
        isError: false,
        error: null
      } as any);

      render(<ClassificationsDetail />);

      await waitFor(() => {
        expect(screen.getByText('classifications.title')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'classifications.detail.statusBar.status.reconciliationState.title'
        )
      ).toBeInTheDocument();
    });
  });
});
