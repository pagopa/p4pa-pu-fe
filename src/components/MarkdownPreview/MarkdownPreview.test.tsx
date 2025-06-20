import { render } from '../../__tests__/renderers';
import { screen } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import { MarkdownPreview } from '.';

const defaultProps = {
  title: 'Test Title',
  message: 'Test message for %debitore_nomeCompleto%',
  open: true,
  onConfirm: vi.fn(),
  onClose: vi.fn()
};

describe('MarkdownPreview', () => {
  it('renders message, using a placeholder ', () => {
    render(<MarkdownPreview {...defaultProps} />);

    expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
  });
});
