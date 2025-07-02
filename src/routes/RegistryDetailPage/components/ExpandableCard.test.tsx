import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor
} from '../../../__tests__/renderers';
import { ExpandableCard } from './ExpandableCard';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import * as clipboardUtils from '../../../utils/clipboard';

vi.mock('../../../utils/clipboard', () => ({
  copyToClipboard: vi.fn()
}));

describe('ExpandableCard', () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'commons.showMore': 'Mostra di più',
      'commons.showLess': 'Mostra di meno'
    };
    return translations[key] || key;
  });

  beforeEach(() => {
    vi.clearAllMocks();

    i18nTestSetup({
      'commons.copied': 'Copiato!'
    });
  });

  describe('Content Display', () => {
    it('should display short content without truncation', () => {
      const shortContent = 'Short text';

      render(
        <ExpandableCard
          content={shortContent}
          t={mockT}
          maxPreviewLength={50}
        />
      );

      expect(screen.getByText(shortContent)).toBeInTheDocument();
      expect(screen.queryByText('Mostra di più')).not.toBeInTheDocument();
    });

    it('should truncate long content and show expand button', () => {
      const longContent =
        'This is a very long text that should be truncated because it exceeds the maximum preview length';

      render(
        <ExpandableCard content={longContent} t={mockT} maxPreviewLength={20} />
      );

      expect(screen.getByText(/This is a very long/)).toBeInTheDocument();
      expect(screen.getByText('Mostra di più')).toBeInTheDocument();

      expect(screen.queryByText(longContent)).not.toBeInTheDocument();
    });

    it('should use custom maxPreviewLength', () => {
      const content = '12345678901234567890';

      render(
        <ExpandableCard content={content} t={mockT} maxPreviewLength={10} />
      );

      expect(screen.getByText('1234567890...')).toBeInTheDocument();
      expect(screen.getByText('Mostra di più')).toBeInTheDocument();
    });
  });

  describe('Expand/Collapse Functionality', () => {
    const longContent =
      'This is a very long text that should be truncated because it exceeds the maximum preview length and needs to be expanded to view fully';

    it('should expand content when clicking "Mostra di più"', () => {
      render(
        <ExpandableCard content={longContent} t={mockT} maxPreviewLength={20} />
      );

      const expandButton = screen.getByText('Mostra di più');
      fireEvent.click(expandButton);

      expect(screen.getByText(longContent)).toBeInTheDocument();
      expect(screen.getByText('Mostra di meno')).toBeInTheDocument();
      expect(screen.queryByText('Mostra di più')).not.toBeInTheDocument();
    });

    it('should collapse content when clicking "Mostra di meno"', () => {
      render(
        <ExpandableCard content={longContent} t={mockT} maxPreviewLength={20} />
      );

      fireEvent.click(screen.getByText('Mostra di più'));
      expect(screen.getByText('Mostra di meno')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Mostra di meno'));
      expect(screen.getByText('Mostra di più')).toBeInTheDocument();
      expect(screen.queryByText('Mostra di meno')).not.toBeInTheDocument();
    });

    it('should toggle between expanded and collapsed states multiple times', () => {
      render(
        <ExpandableCard content={longContent} t={mockT} maxPreviewLength={20} />
      );

      for (let i = 0; i < 3; i++) {
        fireEvent.click(screen.getByText('Mostra di più'));
        expect(screen.getByText('Mostra di meno')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Mostra di meno'));
        expect(screen.getByText('Mostra di più')).toBeInTheDocument();
      }
    });
  });

  describe('Copy Functionality', () => {
    const testContent = 'Content to copy';

    it('should call copyToClipboard when copy button is clicked', () => {
      const copyToClipboardSpy = vi.spyOn(clipboardUtils, 'copyToClipboard');

      render(<ExpandableCard content={testContent} t={mockT} />);

      const copyIcon = screen.getByTestId('ContentCopyIcon');
      const copyButton = copyIcon.closest('button');
      expect(copyButton).toBeInTheDocument();
      fireEvent.click(copyButton!);

      expect(copyToClipboardSpy).toHaveBeenCalledWith(
        testContent,
        expect.any(Function)
      );
    });

    it('should show tooltip when content is copied', async () => {
      vi.spyOn(clipboardUtils, 'copyToClipboard').mockImplementation(
        (_content, setCopied) => {
          setCopied(true);
          return Promise.resolve();
        }
      );

      render(<ExpandableCard content={testContent} t={mockT} />);

      const copyIcon = screen.getByTestId('ContentCopyIcon');
      const copyButton = copyIcon.closest('button');
      expect(copyButton).toBeInTheDocument();
      fireEvent.click(copyButton!);

      await waitFor(() => {
        expect(screen.getByText('Copiato!')).toBeInTheDocument();
      });
    });

    it('should copy full content even when truncated', () => {
      const longContent =
        'This is a very long text that should be truncated but the full content should be copied';
      const copyToClipboardSpy = vi.spyOn(clipboardUtils, 'copyToClipboard');

      render(
        <ExpandableCard content={longContent} t={mockT} maxPreviewLength={20} />
      );

      const copyIcon = screen.getByTestId('ContentCopyIcon');
      const copyButton = copyIcon.closest('button');
      expect(copyButton).toBeInTheDocument();
      fireEvent.click(copyButton!);

      expect(copyToClipboardSpy).toHaveBeenCalledWith(
        longContent,
        expect.any(Function)
      );
    });
  });

  describe('Accessibility and UI Elements', () => {
    it('should render copy button with proper accessibility attributes', () => {
      render(<ExpandableCard content="Test content" t={mockT} />);

      const copyIcon = screen.getByTestId('ContentCopyIcon');
      const copyButton = copyIcon.closest('button');
      expect(copyButton).toBeInTheDocument();
      expect(copyButton).toHaveAttribute('type', 'button');
    });

    it('should preserve whitespace in content', () => {
      const contentWithWhitespace = 'Line 1\nLine 2\n\nLine 3';

      render(<ExpandableCard content={contentWithWhitespace} t={mockT} />);

      const textElement = screen.getByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === 'p' &&
          content.includes('Line 1') &&
          content.includes('Line 2') &&
          content.includes('Line 3')
        );
      });
      expect(textElement).toHaveStyle('white-space: pre-wrap');
    });

    it('should apply proper styling to expand/collapse button', () => {
      const longContent = 'This is a very long text that needs to be truncated';

      render(
        <ExpandableCard content={longContent} t={mockT} maxPreviewLength={20} />
      );

      const expandButton = screen.getByText('Mostra di più');
      expect(expandButton).toHaveClass('MuiButton-text');
      expect(expandButton).toHaveClass('MuiButton-sizeSmall');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      render(<ExpandableCard content="" t={mockT} />);

      const textElement = screen.getByRole('paragraph');
      expect(textElement).toBeInTheDocument();
      expect(textElement).toBeEmptyDOMElement();
      expect(screen.queryByText('Mostra di più')).not.toBeInTheDocument();
    });

    it('should handle content exactly at maxPreviewLength', () => {
      const exactLengthContent = '12345678901234567890';

      render(
        <ExpandableCard
          content={exactLengthContent}
          t={mockT}
          maxPreviewLength={20}
        />
      );

      expect(screen.getByText(exactLengthContent)).toBeInTheDocument();
      expect(screen.queryByText('Mostra di più')).not.toBeInTheDocument();
    });

    it('should handle content one character over maxPreviewLength', () => {
      const slightlyLongContent = '123456789012345678901';

      render(
        <ExpandableCard
          content={slightlyLongContent}
          t={mockT}
          maxPreviewLength={20}
        />
      );

      expect(screen.getByText('12345678901234567890...')).toBeInTheDocument();
      expect(screen.getByText('Mostra di più')).toBeInTheDocument();
    });
  });
});
