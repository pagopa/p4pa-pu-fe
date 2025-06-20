/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  screen,
  fireEvent,
  render,
  RenderOptions
} from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import DebtPositionCreateWizardCompleted from './DebtPositionCreateWizardCompleted';
import config from '../../utils/config';
import * as GlobalStore from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import debtPositions from '../../api/debtPositions';
import utils from '../../utils';
import { FilterValues } from '../../models/Filters';

// Create mock filter values
const mockFilterValues: FilterValues = {
  ACCOUNTING_DATE_FROM: null,
  ACCOUNTING_DATE_TO: null,
  AMOUNT: null,
  BILL_CODE: '',
  BILL_FROM: null,
  DOCUMENT_CODE: '',
  DOCUMENT_CODE_FROM: null,
  IUV: '',
  IUR: '',
  IUD: '',
  IUF: '',
  PAYER: '',
  REPORT_ID: '',
  TEMPORARY_CODE: '',
  TEMPORARY_CODE_FROM: null,
  VALUE_DATE_FROM: null,
  VALUE_DATE_TO: null,
  CLASSIFICATION_TYPE: '',
  LAST_CLASSIFICATION_DATE_FROM: null,
  LAST_CLASSIFICATION_DATE_TO: null,
  REGULATION_DATE_FROM: null,
  REGULATION_DATE_TO: null
};

// Create mock store context
const mockStoreValue = {
  state: {
    [STATE.ORGANIZATION_ID]: 3,
    [STATE.ORGANIZATIONS]: [],
    [STATE.USER_INFO]: undefined,
    [STATE.CONFIG_FE]: undefined,
    [STATE.APP_STATE]: {
      loading: false,
      customBreadcrumbsItems: [],
      ready: false
    },
    [STATE.SELECTED_FILTERS]: [],
    [STATE.FILTER_VALUES]: mockFilterValues,
    [STATE.OPERATOR_ROLE]: undefined,
    [STATE.ID_TOKEN]: undefined
  }
};

// Spy on useStore to return mock value
const useStoreSpy = vi.spyOn(GlobalStore, 'useStore');

// Mock useNavigate and useLocation
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useLocation: vi.fn(),
    useNavigate: vi.fn()
  };
});

// Mock debtPositions API
vi.mock('../../api/debtPositions', () => ({
  default: {
    getDebtPositionZipFile: vi.fn()
  }
}));

// Mock utils
vi.mock('../../utils', () => ({
  default: {
    notify: {
      emit: vi.fn()
    }
  }
}));

// Mock downloadBlob
vi.mock('../../utils/download', () => ({
  downloadBlob: vi.fn()
}));

// react-i18next mock
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      // Simple implementation for translations used in tests
      if (key === 'debtPositionCreateWizardCompleted.title') {
        return `The debt position '${options?.paymentObject || ''}' has been created!`;
      }
      if (key === 'debtPositionCreateWizardCompleted.description') {
        return 'You can find it in the Debts section, where you can track its progress.';
      }
      if (key === 'debtPositionCreateWizardCompleted.backToStart') {
        return 'Back to start';
      }
      if (key === 'debtPositionCreateWizardCompleted.downloadDebtPosition') {
        return 'Download';
      }
      if (key === 'commons.files.missingDebtPositionId') {
        return 'Missing debt position ID';
      }
      if (key === 'commons.files.downloadFailed') {
        return 'Download failed';
      }
      return key;
    }
  })
}));

// Custom render with store and router context
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  useStoreSpy.mockReturnValue(mockStoreValue);

  return render(<MemoryRouter>{ui}</MemoryRouter>, options);
};

describe('DebtPositionCreateWizardCompleted', () => {
  const mockNavigate = vi.fn();
  const originalDeployPath = config.deployPath;

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockNavigate
    );

    // Ensure useStore returns mock value
    useStoreSpy.mockReturnValue(mockStoreValue);

    // Set environment variable for tests
    vi.stubEnv('VITE_DEPLOY_PATH', '/test-path');

    // Directly update the config.deployPath value
    config.deployPath = '/test-path';
  });

  afterEach(() => {
    // Restore original environment variables after each test
    vi.unstubAllEnvs();

    // Restore original config.deployPath value
    config.deployPath = originalDeployPath;
  });

  it('correctly renders the component with title and description', () => {
    // Configure useLocation mock to provide a description
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { description: 'Test Payment' }
    });

    customRender(<DebtPositionCreateWizardCompleted />);

    // Verify that title contains the description
    expect(
      screen.getByText(/The debt position 'Test Payment' has been created!/i)
    ).toBeInTheDocument();

    // Verify that description is present
    expect(
      screen.getByText(
        /You can find it in the Debts section, where you can track its progress./i
      )
    ).toBeInTheDocument();

    // Verify that "Back to start" button is present
    expect(
      screen.getByRole('button', { name: /Back to start/i })
    ).toBeInTheDocument();
  });

  it('correctly handles the case when description is not provided', () => {
    // Configure useLocation mock without description
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: {}
    });

    customRender(<DebtPositionCreateWizardCompleted />);

    // Verify that title contains an empty value for description
    expect(
      screen.getByText(/The debt position '' has been created!/i)
    ).toBeInTheDocument();
  });

  it('navigates correctly when clicking the "Back to start" button', () => {
    // Configure useLocation mock
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { description: 'Test Payment' }
    });

    customRender(<DebtPositionCreateWizardCompleted />);

    // Find and click the button
    const backButton = screen.getByRole('button', {
      name: /Back to start/i
    });
    fireEvent.click(backButton);

    // Verify that navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/test-path/debt-positions/');
  });

  it('calls downloadDebtPositionZip when download button is clicked', async () => {
    // Configure useLocation mock to provide a description and debtPositionId
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { description: 'Test Payment', debtPositionId: 123 }
    });

    const mutateMock = vi.fn();

    vi.mocked(debtPositions.getDebtPositionZipFile).mockReturnValue({
      mutateAsync: mutateMock.mockReturnValue({
        data: new Blob(['test data'], { type: 'application/zip' }),
        fileName: 'test-file.zip'
      })
    } as any);
    // Mock the downloadBlob functio

    customRender(<DebtPositionCreateWizardCompleted />);

    // Find and click the download button
    const downloadButton = screen.getByRole('button', { name: /Download/i });
    fireEvent.click(downloadButton);

    // Wait for the async function to complete
    await vi.waitFor(() => {
      // Verify that downloadDebtPositionZip was called with the correct arguments
      expect(debtPositions.getDebtPositionZipFile).toHaveBeenCalledWith(3);
      expect(mutateMock).toHaveBeenCalledWith(123);
    });
  });

  it('handles error when download fails', async () => {
    // Configure useLocation mock to provide a description and debtPositionId
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { description: 'Test Payment', debtPositionId: 123 }
    });

    const mutateMock = vi.fn();
    // Setup mock for downloadDebtPositionZip to throw an error
    vi.mocked(debtPositions.getDebtPositionZipFile).mockReturnValue({
      mutateAsync: mutateMock.mockRejectedValue(new Error('Download failed'))
    } as any);

    customRender(<DebtPositionCreateWizardCompleted />);

    // Find and click the download button
    const downloadButton = screen.getByRole('button', { name: /Download/i });
    fireEvent.click(downloadButton);

    // Wait for the async function to complete
    await vi.waitFor(() => {
      // Verify that the error notification was emitted
      expect(utils.notify.emit).toHaveBeenCalledWith('Download failed');
    });
  });

  it('correctly handles DRAFT status and renders view button', () => {
    // Configure useLocation mock with DRAFT status
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: {
        description: 'Draft Payment',
        status: 'DRAFT',
        debtPositionId: 123
      }
    });

    customRender(<DebtPositionCreateWizardCompleted />);

    // Verify that view button is present
    const viewButton = screen.getByRole('button', {
      name: /debtPositionCreateWizardCompleted.viewDebtPosition/i
    });
    expect(viewButton).toBeInTheDocument();

    // Click the view button
    fireEvent.click(viewButton);

    // Verify that navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/test-path/debt-positions/123');
  });

  it('handles case when debtPositionId is missing during download', async () => {
    // Configure useLocation mock without debtPositionId
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { description: 'Test Payment' }
    });

    customRender(<DebtPositionCreateWizardCompleted />);

    // Find and click the download button
    const downloadButton = screen.getByRole('button', { name: /Download/i });
    fireEvent.click(downloadButton);

    // Verify error notification was shown
    expect(utils.notify.emit).toHaveBeenCalledWith('Missing debt position ID');
  });

  it('handles case when download result is null', async () => {
    // Configure useLocation mock with debtPositionId
    (useLocation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { description: 'Test Payment', debtPositionId: 123 }
    });

    // Setup mock for downloadDebtPositionZip to return null
    vi.mocked(debtPositions.getDebtPositionZipFile).mockReturnValue({
      mutateAsync: vi.fn().mockReturnValue(null)
    } as any);

    customRender(<DebtPositionCreateWizardCompleted />);

    // Find and click the download button
    const downloadButton = screen.getByRole('button', { name: /Download/i });
    fireEvent.click(downloadButton);

    // Wait for the async function to complete
    await vi.waitFor(() => {
      // Verify error notification was shown
      expect(utils.notify.emit).toHaveBeenCalledWith('Download failed');
    });
  });
});
