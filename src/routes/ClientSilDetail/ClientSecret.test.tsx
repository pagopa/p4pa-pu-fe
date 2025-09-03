import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, render, fireEvent } from '../../__tests__/renderers';
import ClientSecret from './ClientSecret';
import { copyToClipboard } from '../../utils/clipboard';
import { generateClientSecret } from '../../api/clientSil';

vi.mock('../../utils/clipboard', () => ({
  copyToClipboard: vi.fn()
}));
vi.mock('../../api/clientSil', () => ({
  generateClientSecret: vi.fn()
}));

describe('ClientSecret Component', () => {
  const secret = 'secret-value';
  const organizationId = 123;
  const clientId = 'client-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('show middott as default', () => {
    render(
      <ClientSecret
        secretValue={secret}
        organizationId={organizationId}
        clientId={clientId}
      />
    );
    expect(screen.getByText(/••••••/)).toBeInTheDocument();
  });

  it('show value when the visible-button-toggle is clicked', () => {
    render(
      <ClientSecret
        secretValue={secret}
        organizationId={organizationId}
        clientId={clientId}
      />
    );
    const toggleButton = screen.getByTestId('show-secret-value');
    fireEvent.click(toggleButton);
    expect(screen.getByText(secret)).toBeInTheDocument();
  });

  it('use copyToClipboard when copy-button is clicked', () => {
    render(
      <ClientSecret
        secretValue={secret}
        organizationId={organizationId}
        clientId={clientId}
      />
    );
    const copyButton = screen.getByTestId('specific-params-copy-button');
    fireEvent.click(copyButton);
    expect(copyToClipboard).toHaveBeenCalledWith(secret, expect.any(Function));
  });

  it('use Reloadsecrete button to reload secret value', async () => {
    const organizationId = 123;
    const mockGenerate = generateClientSecret as ReturnType<typeof vi.fn>;
    mockGenerate.mockReturnValue({
      mutateAsync: vi.fn()
    });
    render(
      <ClientSecret
        secretValue={secret}
        organizationId={organizationId}
        clientId={clientId}
      />
    );
    const reloadButton = screen.getByTestId('reload-secret-button');
    fireEvent.click(reloadButton);
    expect(generateClientSecret).toHaveBeenCalledWith(organizationId);
  });
});
