import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TelematicReceiptDetail } from '.';
import { render, screen } from '@testing-library/react';
import { useLoaderData } from 'react-router-dom';
import { getReceiptDetail } from '../../api/receiptDetail';
import { receiptDetailDTOSchema } from '../../../generated/zod-schema';
import { createMock } from 'zodock';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';

vi.mock('../../api/receiptDetail', () => ({
  getReceiptDetail: vi.fn(),
}));
vi.mock('react-router-dom', () => ({
  useLoaderData: vi.fn(),
}));
vi.mock('../../store/GlobalStore', () => ({
  useStore: vi.fn()
}));


describe('TelematicReceiptDetail Page', () => {

  const mockOrganizationId = '123';
  const mockData = createMock(receiptDetailDTOSchema);


  beforeEach(() => {
    vi.clearAllMocks();

    (useLoaderData as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ id: mockData.receiptId });
    (useStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { [STATE.ORGANIZATION_ID]: mockOrganizationId }
    });

    (getReceiptDetail as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: mockData });

  });

      
  it('renders Telematic Receipt Detail without crashing', () => {

    render(<TelematicReceiptDetail />);

    expect(screen.getByText(mockData.iud)).toBeInTheDocument();
    expect(screen.getByText(mockData.remittanceInformation)).toBeInTheDocument();
  });
});
