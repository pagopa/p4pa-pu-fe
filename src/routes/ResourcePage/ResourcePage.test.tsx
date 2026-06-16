import { describe, it, expect, beforeEach, vi } from 'vitest';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { render, screen } from '../../__tests__/renderers';
import { setConfigFe } from '../../store/ConfigFeStore';
import loaders from '../../utils/loaders';
import ResourcePage from './ResourcePage';

vi.mock('../../utils/loaders', () => ({
  default: {
    useResourceContent: vi.fn()
  }
}));

describe('ResourcePage', () => {
  const mockUseResourceContent = vi.mocked(loaders.useResourceContent);

  beforeEach(() => {
    vi.clearAllMocks();
    setConfigFe({ externalId: 'broker-external-id' } as Parameters<
      typeof setConfigFe
    >[0]);

    i18nTestSetup({
      resourcePage: {
        error: 'Risorsa non disponibile'
      }
    });
  });

  it('should render the resource markdown content', () => {
    mockUseResourceContent.mockReturnValue({
      data: '# Privacy policy\n\nContent with **bold text**',
      isError: false
    } as ReturnType<typeof loaders.useResourceContent>);

    render(<ResourcePage resource="pp" />);

    expect(mockUseResourceContent).toHaveBeenCalledWith(
      'pp',
      'it',
      'broker-external-id'
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Privacy policy' })
    ).toBeInTheDocument();
    expect(screen.getByText('bold text')).toBeInTheDocument();
    expect(screen.getByText('bold text').tagName).toBe('STRONG');
  });

  it('should render the resource not available error', () => {
    mockUseResourceContent.mockReturnValue({
      data: undefined,
      isError: true
    } as ReturnType<typeof loaders.useResourceContent>);

    render(<ResourcePage resource="tos" />);

    expect(mockUseResourceContent).toHaveBeenCalledWith(
      'tos',
      'it',
      'broker-external-id'
    );
    expect(screen.getByText('Risorsa non disponibile')).toBeInTheDocument();
  });
});
