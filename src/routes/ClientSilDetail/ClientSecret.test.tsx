import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, render, fireEvent } from '../../__tests__/renderers';
import ClientSecret from './ClientSecret';
import { copyToClipboard } from '../../utils/clipboard';

vi.mock('../../utils/clipboard', () => ({
  copyToClipboard: vi.fn()
}));

describe('ClientSecret Component', () => {
  const secret = 'secret-value';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('show middott as default', () => {
    render(<ClientSecret secretValue={secret} />);
    expect(screen.getByText(/••••••/)).toBeInTheDocument();
  });

  it('show value when the visible-button-toggle is clicked', () => {
    render(<ClientSecret secretValue={secret} />);
    const toggleButton = screen.getByTestId('show-secret-value');
    fireEvent.click(toggleButton);
    expect(screen.getByText(secret)).toBeInTheDocument();
  });

  it('use copyToClipboard when copy-button is clicked', () => {
    render(<ClientSecret secretValue={secret} />);
    const copyButton = screen.getByTestId('specific-params-copy-button');
    fireEvent.click(copyButton);
    expect(copyToClipboard).toHaveBeenCalledWith(secret, expect.any(Function));
  });
});
