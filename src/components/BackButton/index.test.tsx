import { screen, fireEvent } from '@testing-library/react';
import { useNavigate } from 'react-router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { render } from '../../__tests__/renderers';
import { BackButton } from '.';

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn()
  };
});

vi.mock('../../hooks/useSmartBack', () => ({
  useSmartBack: vi.fn()
}));

const mockNavigate = vi.fn();
const mockHandleSmartBack = vi.fn();
const mockUseNavigate = useNavigate as ReturnType<typeof vi.fn>;
const mockUseLocation = vi.mocked(await import('react-router')).useLocation;
const mockUseSmartBack = vi.mocked(
  await import('../../hooks/useSmartBack')
).useSmartBack;

describe('BackButton', () => {
  beforeEach(() => {
    i18nTestSetup({
      'commons.back': 'Back'
    });

    mockNavigate.mockClear();
    mockHandleSmartBack.mockClear();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseSmartBack.mockReturnValue({ handleSmartBack: mockHandleSmartBack });

    Object.defineProperty(window, 'history', {
      value: { length: 2 },
      writable: true
    });
  });

  describe('when history is available', () => {
    beforeEach(() => {
      mockUseLocation.mockReturnValue({
        key: 'some-key',
        pathname: '/current-path',
        search: '',
        hash: '',
        state: null
      });
    });

    it('should render button with default text', () => {
      render(<BackButton />);

      const button = screen.getByRole('button', { name: 'Back' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Back');
    });

    it('should render button with custom text', () => {
      const customText = 'Go back to list';
      render(<BackButton text={customText} />);

      const button = screen.getByRole('button', { name: customText });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent(customText);
    });

    it('should call handleSmartBack when clicked (default Smart Back enabled)', () => {
      render(<BackButton />);

      const button = screen.getByRole('button', { name: 'Back' });
      fireEvent.click(button);

      expect(mockHandleSmartBack).toHaveBeenCalledTimes(1);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should call navigate(-2) when fromSuccess flag is true (legacy mode)', () => {
      mockUseLocation.mockReturnValue({
        key: 'some-key',
        pathname: '/current-path',
        search: '',
        hash: '',
        state: { fromSuccess: true }
      });

      render(<BackButton enableSmartBack={false} />);

      const button = screen.getByRole('button', { name: 'Back' });
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith(-2);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should call navigate(-2) when category includes success (legacy mode)', () => {
      mockUseLocation.mockReturnValue({
        key: 'some-key',
        pathname: '/current-path',
        search: '',
        hash: '',
        state: { category: 'assessment-create-success' }
      });

      render(<BackButton enableSmartBack={false} />);

      const button = screen.getByRole('button', { name: 'Back' });
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith(-2);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should call navigate(-2) when both fromSuccess and category are present (legacy mode)', () => {
      mockUseLocation.mockReturnValue({
        key: 'some-key',
        pathname: '/current-path',
        search: '',
        hash: '',
        state: {
          fromSuccess: true,
          category: 'org-sil-service-update-success'
        }
      });

      render(<BackButton enableSmartBack={false} />);

      const button = screen.getByRole('button', { name: 'Back' });
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith(-2);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should call navigate(-1) when category exists but does not include success (legacy mode)', () => {
      mockUseLocation.mockReturnValue({
        key: 'some-key',
        pathname: '/current-path',
        search: '',
        hash: '',
        state: { category: 'assessment-create-pending' }
      });

      render(<BackButton enableSmartBack={false} />);

      const button = screen.getByRole('button', { name: 'Back' });
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should call custom onClick when provided and ignore navigation logic', () => {
      const mockOnClick = vi.fn();

      mockUseLocation.mockReturnValue({
        key: 'some-key',
        pathname: '/current-path',
        search: '',
        hash: '',
        state: { fromSuccess: true }
      });

      render(<BackButton onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: 'Back' });
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should have ArrowBack icon', () => {
      render(<BackButton />);

      const button = screen.getByRole('button', { name: 'Back' });
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should have correct accessibility attributes', () => {
      render(<BackButton />);

      const button = screen.getByRole('button', { name: 'Back' });
      expect(button).toHaveAttribute('aria-label', 'Back');
    });
  });

  describe('when history is NOT available', () => {
    it('should NOT render when location.key is "default" AND history.length is 1', () => {
      mockUseLocation.mockReturnValue({
        key: 'default',
        pathname: '/current-path',
        search: '',
        hash: '',
        state: null
      });

      Object.defineProperty(window, 'history', {
        value: { length: 1 },
        writable: true
      });

      render(<BackButton />);

      const button = screen.queryByRole('button', { name: 'Back' });
      expect(button).not.toBeInTheDocument();
    });

    it('should render when location.key is "default" BUT history.length > 1 (browser history available)', () => {
      const mockHistoryBack = vi.fn();
      mockUseLocation.mockReturnValue({
        key: 'default',
        pathname: '/current-path',
        search: '',
        hash: '',
        state: null
      });

      Object.defineProperty(window, 'history', {
        value: { length: 2, back: mockHistoryBack },
        writable: true,
        configurable: true
      });

      render(<BackButton />);

      const button = screen.queryByRole('button', { name: 'Back' });
      expect(button).toBeInTheDocument();

      fireEvent.click(button!);
      expect(mockHistoryBack).toHaveBeenCalledTimes(1);
      expect(mockHandleSmartBack).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should NOT render when window.history.length is 1', () => {
      mockUseLocation.mockReturnValue({
        key: 'some-key',
        pathname: '/current-path',
        search: '',
        hash: '',
        state: null
      });

      Object.defineProperty(window, 'history', {
        value: { length: 1 },
        writable: true
      });

      render(<BackButton />);

      const button = screen.queryByRole('button', { name: 'Back' });
      expect(button).not.toBeInTheDocument();
    });

    it('should NOT render when both conditions are false', () => {
      mockUseLocation.mockReturnValue({
        key: 'default',
        pathname: '/current-path',
        search: '',
        hash: '',
        state: null
      });

      Object.defineProperty(window, 'history', {
        value: { length: 1 },
        writable: true
      });

      render(<BackButton />);

      const button = screen.queryByRole('button', { name: 'Back' });
      expect(button).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      mockUseLocation.mockReturnValue({
        key: 'some-key',
        pathname: '/current-path',
        search: '',
        hash: '',
        state: null
      });
    });

    it('should handle empty text', () => {
      render(<BackButton text="" />);

      const button = screen.getByRole('button', { name: '' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('');
    });

    it('should handle null state gracefully with Smart Back', () => {
      mockUseLocation.mockReturnValue({
        key: 'some-key',
        pathname: '/current-path',
        search: '',
        hash: '',
        state: null
      });

      render(<BackButton />);

      const button = screen.getByRole('button', { name: 'Back' });
      fireEvent.click(button);

      expect(mockHandleSmartBack).toHaveBeenCalledTimes(1);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle undefined state gracefully with Smart Back', () => {
      mockUseLocation.mockReturnValue({
        key: 'some-key',
        pathname: '/current-path',
        search: '',
        hash: '',
        state: undefined
      });

      render(<BackButton />);

      const button = screen.getByRole('button', { name: 'Back' });
      fireEvent.click(button);

      expect(mockHandleSmartBack).toHaveBeenCalledTimes(1);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle state without fromSuccess or category with Smart Back', () => {
      mockUseLocation.mockReturnValue({
        key: 'some-key',
        pathname: '/current-path',
        search: '',
        hash: '',
        state: { someOtherProperty: 'value' }
      });

      render(<BackButton />);

      const button = screen.getByRole('button', { name: 'Back' });
      fireEvent.click(button);

      expect(mockHandleSmartBack).toHaveBeenCalledTimes(1);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
