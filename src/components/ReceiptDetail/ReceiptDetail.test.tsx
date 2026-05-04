/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import { Download } from '@mui/icons-material';
import ReceiptDetail from '.';
import { ReceiptDetailDTO } from '../../../generated/apiClient';

vi.mock('../TitleComponent/TitleComponent', () => ({
  default: ({ title, accessibleTitle, callToAction }: any) => (
    <div data-testid="title-component">
      <h1>{title}</h1>
      <span data-testid="accessible-title">{accessibleTitle}</span>
      {callToAction?.map((action: any, index: number) => (
        <button
          key={index}
          data-testid="call-to-action"
          onClick={action.onActionClick}
        >
          {action.buttonText}
        </button>
      ))}
    </div>
  )
}));

vi.mock('../DetailContainer/DetailContainer', () => ({
  default: ({ sections }: any) => (
    <div data-testid="detail-container">
      {sections.map((section: any, index: number) => (
        <div key={index} data-testid="section">
          <h2>{section.title.label}</h2>
          {section.data.map((item: any, itemIndex: number) => (
            <div key={itemIndex} data-testid="detail-item">
              <span data-testid="label">{item.label}</span>
              <span data-testid="value">{item.value}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}));

describe('ReceiptDetail Component', () => {
  const mockSummaryData = [
    { label: 'IUV', value: 'IUV123456789' },
    { label: 'Amount', value: '100,00 €' },
    { label: 'Reason', value: 'Payment for services' }
  ];

  const mockPaymentData = [
    { label: 'Payment Date', value: '15/01/2025' },
    { label: 'PSP', value: 'Test PSP Company' },
    { label: 'IUD', value: 'IUD987654321' },
    { label: 'IUR', value: 'IUR111222333' }
  ];

  const defaultProps = {
    pageTitle: 'Receipt Detail',
    accessibleTitle: 'Receipt Detail Page',
    summaryData: mockSummaryData,
    paymentData: mockPaymentData
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ReceiptDetail {...defaultProps} />);

    expect(screen.getByTestId('title-component')).toBeInTheDocument();
  });

  it('renders TitleComponent with correct props', () => {
    render(<ReceiptDetail {...defaultProps} />);

    expect(screen.getByText('Receipt Detail')).toBeInTheDocument();
    expect(screen.getByTestId('accessible-title')).toHaveTextContent(
      'Receipt Detail Page'
    );
  });

  it('renders TitleComponent without call to action when not provided', () => {
    render(<ReceiptDetail {...defaultProps} />);

    expect(screen.queryByTestId('call-to-action')).not.toBeInTheDocument();
  });

  it('renders TitleComponent with call to action when provided', () => {
    const mockCallToAction = {
      icon: <Download />,
      variant: 'contained' as const,
      buttonText: 'Download',
      onActionClick: vi.fn()
    };

    render(<ReceiptDetail {...defaultProps} callToAction={mockCallToAction} />);

    const button = screen.getByTestId('call-to-action');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Download');
  });

  it('calls onActionClick when call to action button is clicked', () => {
    const mockOnActionClick = vi.fn();
    const mockCallToAction = {
      icon: <Download />,
      variant: 'contained' as const,
      buttonText: 'Download',
      onActionClick: mockOnActionClick
    };

    render(<ReceiptDetail {...defaultProps} callToAction={mockCallToAction} />);

    const button = screen.getByTestId('call-to-action');
    button.click();

    expect(mockOnActionClick).toHaveBeenCalledTimes(1);
  });

  it('renders two Grid items with DetailContainers', () => {
    render(<ReceiptDetail {...defaultProps} />);

    const detailContainers = screen.getAllByTestId('detail-container');
    expect(detailContainers).toHaveLength(2);
  });

  it('renders summary section with correct title', () => {
    render(<ReceiptDetail {...defaultProps} />);

    expect(screen.getByText('commons.summary')).toBeInTheDocument();
  });

  it('renders payment section with correct title', () => {
    render(<ReceiptDetail {...defaultProps} />);

    expect(screen.getByText('commons.payment')).toBeInTheDocument();
  });

  it('renders all summary data items', () => {
    render(<ReceiptDetail {...defaultProps} />);

    const sections = screen.getAllByTestId('section');
    const summarySection = sections[0];

    const labels = summarySection.querySelectorAll('[data-testid="label"]');
    const values = summarySection.querySelectorAll('[data-testid="value"]');

    expect(labels).toHaveLength(mockSummaryData.length);
    expect(values).toHaveLength(mockSummaryData.length);

    mockSummaryData.forEach((item, index) => {
      expect(labels[index]).toHaveTextContent(item.label);
      expect(values[index]).toHaveTextContent(item.value);
    });
  });

  it('renders all payment data items', () => {
    render(<ReceiptDetail {...defaultProps} />);

    const sections = screen.getAllByTestId('section');
    const paymentSection = sections[1];

    const labels = paymentSection.querySelectorAll('[data-testid="label"]');
    const values = paymentSection.querySelectorAll('[data-testid="value"]');

    expect(labels).toHaveLength(mockPaymentData.length);
    expect(values).toHaveLength(mockPaymentData.length);

    mockPaymentData.forEach((item, index) => {
      expect(labels[index]).toHaveTextContent(item.label);
      expect(values[index]).toHaveTextContent(item.value);
    });
  });

  it('renders with empty summary data', () => {
    render(<ReceiptDetail {...defaultProps} summaryData={[]} />);

    const sections = screen.getAllByTestId('section');
    const summarySection = sections[0];

    expect(
      summarySection.querySelectorAll('[data-testid="detail-item"]')
    ).toHaveLength(0);
  });

  it('renders with empty payment data', () => {
    render(<ReceiptDetail {...defaultProps} paymentData={[]} />);

    const sections = screen.getAllByTestId('section');
    const paymentSection = sections[1];

    expect(
      paymentSection.querySelectorAll('[data-testid="detail-item"]')
    ).toHaveLength(0);
  });

  it('passes correct sections structure to summary DetailContainer', () => {
    render(<ReceiptDetail {...defaultProps} />);

    const sections = screen.getAllByTestId('section');
    const summarySection = sections[0];

    expect(summarySection).toBeInTheDocument();
    expect(summarySection.querySelector('h2')).toHaveTextContent(
      'commons.summary'
    );
  });

  it('passes correct sections structure to payment DetailContainer', () => {
    render(<ReceiptDetail {...defaultProps} />);

    const sections = screen.getAllByTestId('section');
    const paymentSection = sections[1];

    expect(paymentSection).toBeInTheDocument();
    expect(paymentSection.querySelector('h2')).toHaveTextContent(
      'commons.payment'
    );
  });

  it('renders view with a warning banner on tech debt position', () => {
    const overridedProps = {
      ...defaultProps,
      debtPositionOrigin:
        'RECEIPT_PAGOPA' as ReceiptDetailDTO['debtPositionOrigin'],
      receiptOrigin: 'RECEIPT_PAGOPA' as ReceiptDetailDTO['receiptOrigin']
    };
    render(<ReceiptDetail {...overridedProps} />);

    const warningBanner = screen.getByTestId('technical-debt-alert');

    expect(warningBanner).toBeInTheDocument();
  });

  it('renders view without a warning banner on tech debt position', () => {
    const overridedProps = {
      ...defaultProps,
      debtPositionOrigin: 'ORDINARY' as ReceiptDetailDTO['debtPositionOrigin'],
      receiptOrigin: 'RECEIPT_PAGOPA' as ReceiptDetailDTO['receiptOrigin']
    };
    render(<ReceiptDetail {...overridedProps} />);

    const warningBanner = screen.queryByTestId('technical-debt-alert');

    expect(warningBanner).not.toBeInTheDocument();
  });
});
