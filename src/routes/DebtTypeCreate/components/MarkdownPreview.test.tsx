import { render } from '../../../__tests__/renderers';
import { screen } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import { MarkdownPreview } from './MarkdownPreview';

const defaultProps = {
  title: 'Test Title',
  message: 'Test message for %debitore_nomeCompleto%',
  open: true,
  onConfirm: vi.fn(),
  onClose: vi.fn()
};

describe('MarkdownPreview', () => {
  it('renders title and message, using a placeholder ', () => {
    render(<MarkdownPreview {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
  });
});
