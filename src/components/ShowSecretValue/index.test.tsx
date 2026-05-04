import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, render, fireEvent } from '../../__tests__/renderers';
import { copyToClipboard } from '../../utils/clipboard';
import ShowSecretValue from '.';

vi.mock('../../utils/clipboard', () => ({
  copyToClipboard: vi.fn()
}));

describe('ShowSecretValue Component', () => {
  const secret = 'secret-value';
  const label = 'Api Key';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('show middott as default', () => {
    render(<ShowSecretValue secretValue={secret} label={label} />);
    expect(screen.getByText(/••••••/)).toBeInTheDocument();
  });

  it('show value when the visible-button-toggle is clicked', () => {
    render(<ShowSecretValue secretValue={secret} label={label} />);
    const toggleButton = screen.getByTestId('show-secret-value');
    fireEvent.click(toggleButton);
    expect(screen.getByText(secret)).toBeInTheDocument();
  });

  it('use copyToClipboard when copy-button is clicked', () => {
    render(<ShowSecretValue secretValue={secret} label={label} />);
    const copyButton = screen.getByTestId('specific-params-copy-button');
    fireEvent.click(copyButton);
    expect(copyToClipboard).toHaveBeenCalledWith(secret, expect.any(Function));
  });
});
