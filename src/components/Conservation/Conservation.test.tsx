import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { getExportFiles } from '../../api/exportFiles';
import Conservation from './Conservation';

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
  ExportFileStatus: {
    COMPLETED: 'COMPLETED'
  },
  ExportFileTypeEnum: {
    RECEIPTS_ARCHIVING: 'RECEIPTS_ARCHIVING'
  }
}));

describe('Conservation', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    i18nTestSetup({
      'commons.routes.CONSERVATION': 'Conservation Title',
      'conservation.description': 'Conservation Description'
    });
  });

  it('renders with correct translations', () => {
    render(<Conservation />);

    expect(screen.getByText('Conservation Title')).toBeDefined();
    expect(screen.getByText('Conservation Description')).toBeDefined();
  });

  it('calls API with correct export file type', () => {
    render(<Conservation />);

    expect(getExportFiles).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({
        exportFileType: 'RECEIPTS_ARCHIVING'
      })
    );
  });
});
