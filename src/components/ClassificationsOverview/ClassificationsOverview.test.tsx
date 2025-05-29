import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { getExportFiles } from '../../api/exportFiles';
import ClassificationsOverview from './ClassificationsOverview';

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn(),
  generatePath: vi.fn()
}));

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
      'commons.routes.CLASSIFICATIONS': 'Classifications Title',
      'classifications.description': 'Classifications Description'
    });
  });

  it('renders with correct translations', () => {
    render(<ClassificationsOverview />);

    expect(screen.getByText('Classifications Title')).toBeDefined();
    expect(screen.getByText('Classifications Description')).toBeDefined();
  });

  it('calls API with correct export file type', () => {
    render(<ClassificationsOverview />);

    expect(getExportFiles).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({
        exportFileType: 'CLASSIFICATIONS'
      })
    );
  });
});
