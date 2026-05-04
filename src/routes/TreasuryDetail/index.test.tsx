import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TreasuryDetail } from '.';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useLoaderData } from 'react-router';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import { getTreasuryDetail } from '../../api/treasuryDetail';
import { getIngestionFlowFile } from '../../api/ingestionFlowFiles';
import { downloadBlob } from '../../utils/download';
import utils from '../../utils';

const mockNavigate = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock('../../api/treasuryDetail', () => ({
  getTreasuryDetail: vi.fn()
}));

vi.mock('../../api/ingestionFlowFiles', () => ({
  getIngestionFlowFile: vi.fn()
}));

vi.mock('../../utils/download', () => ({
  downloadBlob: vi.fn()
}));

vi.mock('../../utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      notify: {
        emit: vi.fn()
      }
    }
  };
});

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useLoaderData: vi.fn(),
  useNavigate: () => mockNavigate
}));

vi.mock('../../store/GlobalStore', () => ({
  useStore: vi.fn()
}));

vi.mock('../../routes', () => ({
  PageRoutes: {
    RESPONSES_ERROR: 'RESPONSES_ERROR'
  }
}));

describe('Treasury detail Page', () => {
  const mockOrganizationId = '123';
  const mockUseLoaderData = vi.mocked(useLoaderData);
  const mockData = {
    creationDate: '2025-02-25T14:48:30.843388',
    updateDate: '2025-03-07T10:03:58.199601',
    updateOperatorExternalId: 'WS_USER-piattaforma-unitaria_',
    treasuryId: '77436-2022-5',
    billYear: '2025',
    billCode: '77438',
    ingestionFlowFileId: 201,
    organizationId: 1,
    iuf: '2024-03-19UNCsITMM-000',
    iuv: '32',
    remittanceDescription:
      '/PUR/LGPE-RIVERSURI.2022-10- TRXID: 0000000000000066',
    billAmountCents: 50000,
    billDate: '2022-10-12',
    receptionDate: '2025-03-07T10:03:57.891082',
    documentCode: '67351  ',
    pspLastName: 'BANCA MONTE',
    pspAddress: 'PIAZZA SALIMBENI,3                                ',
    pspPostalCode: '00000',
    regionValueDate: '2022-10-12',
    actualSuspensionDate: '2022-10-11',
    managementProvisionalCode: '0000099999',
    endToEndId: 'RF05013300000022785700000',
    regularized: false,
    _links: {
      self: {
        href: 'localhost'
      },
      treasury: {
        href: 'localhost'
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockMutateAsync.mockClear();

    mockUseLoaderData.mockReturnValue(mockData.treasuryId);
    (useStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { [STATE.ORGANIZATION_ID]: mockOrganizationId }
    });

    (getTreasuryDetail as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockData
    });

    (
      getIngestionFlowFile as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      mutateAsync: mockMutateAsync
    });
  });

  it('renders Telematic Receipt Detail without crashing', () => {
    render(<TreasuryDetail />);

    expect(screen.getByText(mockData.iuf)).toBeInTheDocument();
    expect(
      screen.getByText(mockData.remittanceDescription)
    ).toBeInTheDocument();
  });

  it('handles missing ID parameter', () => {
    mockUseLoaderData.mockReturnValue(null);

    render(<TreasuryDetail />);

    expect(mockNavigate).toHaveBeenCalledWith('RESPONSES_ERROR');
  });

  it('handles API errors correctly', () => {
    (getTreasuryDetail as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('API Error')
    });

    render(<TreasuryDetail />);

    expect(mockNavigate).toHaveBeenCalledWith('RESPONSES_ERROR');
  });

  it('renders download button correctly', () => {
    render(<TreasuryDetail />);

    const downloadButton = screen.getByText('commons.files.download');
    expect(downloadButton).toBeInTheDocument();
  });

  it('downloads file successfully when ingestionFlowFileId is present', async () => {
    const mockFileName = 'treasury-file.zip';
    const mockFileData = new Blob(['test data'], { type: 'application/zip' });

    mockMutateAsync.mockResolvedValue({
      fileName: mockFileName,
      data: mockFileData
    });

    render(<TreasuryDetail />);

    const downloadButton = screen.getByText('commons.files.download');
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        mockData.ingestionFlowFileId
      );
      expect(downloadBlob).toHaveBeenCalledWith(mockFileData, mockFileName);
    });
  });

  it('shows error notification when ingestionFlowFileId is missing', async () => {
    (getTreasuryDetail as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { ...mockData, ingestionFlowFileId: undefined }
    });

    render(<TreasuryDetail />);

    const downloadButton = screen.getByText('commons.files.download');
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(utils.notify.emit).toHaveBeenCalledWith(
        'commons.files.downloadFailed'
      );
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });

  it('handles download API error and shows notification', async () => {
    const mockError = new Error('Download failed');
    mockMutateAsync.mockRejectedValue(mockError);

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    render(<TreasuryDetail />);

    const downloadButton = screen.getByText('commons.files.download');
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        mockData.ingestionFlowFileId
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error downloading treasury file:',
        mockError
      );
      expect(utils.notify.emit).toHaveBeenCalledWith(
        'commons.files.downloadFailed'
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
