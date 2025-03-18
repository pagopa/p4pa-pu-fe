import {
  render,
  screen,
  fireEvent,
  waitFor,
  act
} from '@testing-library/react';
import { CopiableTypography } from '../CopiableTypography';
import { describe, it, vi } from 'vitest';

describe('CopiableTypography', () => {
  beforeAll(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined)
      },
      writable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the text content', () => {
    render(<CopiableTypography>Copy this text</CopiableTypography>);
    expect(screen.getByText('Copy this text')).toBeInTheDocument();
  });

  it('shows the "Copied" tooltip on click', async () => {
    render(<CopiableTypography>Copy this text</CopiableTypography>);

    const typography = screen.getByText('Copy this text');

    await act(async () => {
      fireEvent.click(typography);
    });

    const tip = await screen.findByText('commons.copied');
    expect(tip).toBeInTheDocument();
  });

  it('hides the "Copied" tooltip after 2 seconds', async () => {
    render(<CopiableTypography>Copy this text</CopiableTypography>);

    const typography = screen.getByText('Copy this text');
    fireEvent.click(typography);

    expect(await screen.findByText('commons.copied')).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.queryByText('commons.copied')).not.toBeInTheDocument();
      },
      { timeout: 2100 }
    );
  });

  it('does not copy if children is not a string', async () => {
    render(<CopiableTypography>{123}</CopiableTypography>);

    const typography = screen.getByText('123');
    fireEvent.click(typography);

    await waitFor(
      () => {
        expect(screen.queryByText('commons.copied')).not.toBeInTheDocument();
      },
      { timeout: 2100 }
    );
  });
});
