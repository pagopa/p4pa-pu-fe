import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TelematicReceiptDetail } from '.';
import { render, screen, fireEvent } from '@testing-library/react';
import { useLoaderData } from 'react-router';
import { getReceiptDetail } from '../../api/receiptDetail';
import { receiptDetailDTOSchema } from '../../../generated/zod-schema';
import { createMock } from 'zodock';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import * as receiptPdf from '../../api/receiptPdf';

vi.mock('../../api/receiptDetail', () => ({
  getReceiptDetail: vi.fn()
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useLoaderData: vi.fn()
  };
});

vi.mock('../../store/GlobalStore', () => ({
  useStore: vi.fn()
}));

describe('TelematicReceiptDetail Page', () => {
  const mockOrganizationId = 123;
  const mockData = createMock(receiptDetailDTOSchema);

  beforeEach(() => {
    vi.clearAllMocks();

    (useLoaderData as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockData.receiptId
    );
    (useStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { [STATE.ORGANIZATION_ID]: mockOrganizationId }
    });

    (getReceiptDetail as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData
    });
  });

  it('renders Telematic Receipt Detail without crashing', () => {
    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(vi.fn());
    render(<TelematicReceiptDetail />);

    expect(screen.getByText(mockData.iud)).toBeInTheDocument();
    expect(
      screen.getByText(mockData.remittanceInformation)
    ).toBeInTheDocument();
  });

  it('getReceiptPdf is initialized with the correct OrganizationId value', () => {
    const mutateSpy = vi
      .spyOn(receiptPdf, 'getReceiptPdf')
      .mockImplementation(vi.fn());
    render(<TelematicReceiptDetail />);

    expect(mutateSpy).toBeCalledWith(mockOrganizationId);
  });

  it('getReceiptPdf mutation receives the correct receiptId parameter', () => {
    const mutationMock = vi.fn();
    vi.spyOn(receiptPdf, 'getReceiptPdf').mockImplementation(
      () =>
        ({
          mutateAsync: mutationMock
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any
    );
    render(<TelematicReceiptDetail />);
    const downloadButton = screen.getByLabelText('commons.files.download');
    fireEvent.click(downloadButton);
    expect(mutationMock).toBeCalledWith(mockData.receiptId);
  });
});
