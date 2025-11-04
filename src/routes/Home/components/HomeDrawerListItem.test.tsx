import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../__tests__/renderers';
import { HomeDrawerListItem } from './HomeDrawerListItem';

describe('HomeDrawerListItem', () => {
  const mockActionFunction = vi.fn();
  const defaultProps = {
    actionIcon: 'visit' as const,
    actionFunction: mockActionFunction,
    icon: <div>Icon</div>,
    label: 'Test Label'
  };

  beforeEach(() => {
    mockActionFunction.mockClear();
  });

  describe('Rendering', () => {
    it('should render with all required elements', () => {
      render(<HomeDrawerListItem {...defaultProps} />);

      const menuItem = screen.getByTestId('home-drawer-list-item');
      expect(menuItem).toBeInTheDocument();
      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('Icon')).toBeInTheDocument();
    });

    it('should render with visit icon by default', () => {
      render(<HomeDrawerListItem {...defaultProps} />);

      expect(screen.getByTestId('KeyboardArrowRightIcon')).toBeInTheDocument();
      expect(screen.queryByTestId('DownloadIcon')).not.toBeInTheDocument();
    });

    it('should render with download icon when actionIcon is "download"', () => {
      render(<HomeDrawerListItem {...defaultProps} actionIcon="download" />);

      expect(screen.getByTestId('DownloadIcon')).toBeInTheDocument();
      expect(
        screen.queryByTestId('KeyboardArrowRightIcon')
      ).not.toBeInTheDocument();
    });

    it('should render custom icon component', () => {
      const customIcon = <span data-testid="custom-icon">Custom</span>;
      render(<HomeDrawerListItem {...defaultProps} icon={customIcon} />);

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call actionFunction when clicked', () => {
      render(<HomeDrawerListItem {...defaultProps} />);

      const menuItem = screen.getByTestId('home-drawer-list-item');
      fireEvent.click(menuItem);

      expect(mockActionFunction).toHaveBeenCalledTimes(1);
    });

    it('should call actionFunction multiple times on multiple clicks', () => {
      render(<HomeDrawerListItem {...defaultProps} />);

      const menuItem = screen.getByTestId('home-drawer-list-item');
      fireEvent.click(menuItem);
      fireEvent.click(menuItem);
      fireEvent.click(menuItem);

      expect(mockActionFunction).toHaveBeenCalledTimes(3);
    });

    it('should call actionFunction with download icon', () => {
      render(<HomeDrawerListItem {...defaultProps} actionIcon="download" />);

      const menuItem = screen.getByTestId('home-drawer-list-item');
      fireEvent.click(menuItem);

      expect(mockActionFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(<HomeDrawerListItem {...defaultProps} />);

      const menuItem = screen.getByTestId('home-drawer-list-item');
      menuItem.focus();

      expect(menuItem).toHaveFocus();
    });

    it('should render MenuItem with divider prop', () => {
      const { container } = render(<HomeDrawerListItem {...defaultProps} />);

      const menuItem = container.querySelector('[role="menuitem"]');
      expect(menuItem).toBeInTheDocument();
    });
  });
});
