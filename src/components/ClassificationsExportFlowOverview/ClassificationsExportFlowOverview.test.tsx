import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { getExportFiles } from '../../api/exportFiles';
import ClassificationsExportFlowOverview from './ClassificationsExportFlowOverview';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
    generatePath: vi.fn()
  };
});

vi.mock('../../api/exportFiles', () => ({
  getExportFiles: vi.fn().mockReturnValue({ data: { content: [] } }),
  getExportFile: vi.fn(),
  ExportFileStatus: {
    COMPLETED: 'COMPLETED'
  },
  ExportFileTypeEnum: {
    CLASSIFICATIONS: 'CLASSIFICATIONS'
  }
}));

describe('Classifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    i18nTestSetup({
      'commons.exportedFlows': 'Classifications Title',
      'classificationsExport.descriptionOverview': 'Classifications Description'
    });
  });

  it('renders with correct translations', () => {
    render(<ClassificationsExportFlowOverview />);

    expect(screen.getByText('Classifications Title')).toBeDefined();
    expect(screen.getByText('Classifications Description')).toBeDefined();
  });

  it('calls API with correct export file type', () => {
    render(<ClassificationsExportFlowOverview />);

    expect(getExportFiles).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({
        exportFileType: 'CLASSIFICATIONS'
      })
    );
  });
});
