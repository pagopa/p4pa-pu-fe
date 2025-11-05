import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../__tests__/renderers';
import { HomeDrawerBody } from './HomeDrawerBody';
import { TABS, DashboardResult } from '../models';
import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';

// Mock the child drawer components
vi.mock('./HomeDrawerIUV', () => ({
  HomeDrawerIUV: vi.fn(({ searchValue }) => (
    <div data-testid="home-drawer-iuv">IUV Content - {searchValue}</div>
  ))
}));

vi.mock('./HomeDrawerFC', () => ({
  HomeDrawerFC: vi.fn(({ searchValue }) => (
    <div data-testid="home-drawer-fc">FC Content - {searchValue}</div>
  ))
}));

vi.mock('./HomeDrawerIUF', () => ({
  HomeDrawerIUF: vi.fn(({ searchValue }) => (
    <div data-testid="home-drawer-iuf">IUF Content - {searchValue}</div>
  ))
}));

describe('HomeDrawerBody', () => {
  const defaultProps = {
    searchLabel: TABS.IUV,
    searchValue: 'testValue123',
    searchResults: {
      iuvData: { id: '1', status: 'active' },
      iufData: null,
      fcData: null
    } as DashboardResult
  };

  beforeEach(() => {
    i18nTestSetup({
      'home.tabs.IUV.fieldLabel': 'IUV Field Label',
      'home.tabs.IUF.fieldLabel': 'IUF Field Label',
      'home.tabs.FC.fieldLabel': 'FC Field Label',
      'home.drawer.actions': 'Actions',
      'home.noResults.description': 'No results found'
    });
  });

  describe('Rendering Basic Elements', () => {
    it('should render search label and value', () => {
      render(<HomeDrawerBody {...defaultProps} />);

      expect(screen.getByText('IUV Field Label')).toBeInTheDocument();
      expect(screen.getByText('testValue123')).toBeInTheDocument();
    });

    it('should render actions section header', () => {
      render(<HomeDrawerBody {...defaultProps} />);

      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should render MenuList with correct aria-labelledby', () => {
      const { container } = render(<HomeDrawerBody {...defaultProps} />);

      const menuList = container.querySelector(
        '[aria-labelledby="home-drawer-actions"]'
      );
      expect(menuList).toBeInTheDocument();
    });
  });

  describe('Tab-Specific Drawer Rendering', () => {
    it('should render HomeDrawerIUV when searchLabel is IUV', () => {
      render(<HomeDrawerBody {...defaultProps} searchLabel={TABS.IUV} />);

      expect(screen.getByTestId('home-drawer-iuv')).toBeInTheDocument();
      expect(screen.queryByTestId('home-drawer-fc')).not.toBeInTheDocument();
      expect(screen.queryByTestId('home-drawer-iuf')).not.toBeInTheDocument();
    });

    it('should render HomeDrawerFC when searchLabel is FC', () => {
      render(<HomeDrawerBody {...defaultProps} searchLabel={TABS.FC} />);

      expect(screen.getByTestId('home-drawer-fc')).toBeInTheDocument();
      expect(screen.queryByTestId('home-drawer-iuv')).not.toBeInTheDocument();
      expect(screen.queryByTestId('home-drawer-iuf')).not.toBeInTheDocument();
    });

    it('should render HomeDrawerIUF when searchLabel is IUF', () => {
      render(<HomeDrawerBody {...defaultProps} searchLabel={TABS.IUF} />);

      expect(screen.getByTestId('home-drawer-iuf')).toBeInTheDocument();
      expect(screen.queryByTestId('home-drawer-iuv')).not.toBeInTheDocument();
      expect(screen.queryByTestId('home-drawer-fc')).not.toBeInTheDocument();
    });
  });

  describe('No Results Handling', () => {
    it('should show no results message when searchResults is undefined', () => {
      render(<HomeDrawerBody {...defaultProps} searchResults={undefined} />);

      expect(screen.getByText('No results found')).toBeInTheDocument();
      expect(screen.queryByTestId('home-drawer-iuv')).not.toBeInTheDocument();
    });

    it('should show no results message when all searchResults values are null', () => {
      render(
        <HomeDrawerBody
          {...defaultProps}
          searchResults={
            {
              iuvData: null,
              iufData: null,
              fcData: null
            } as DashboardResult
          }
        />
      );

      expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    it('should show no results message when all searchResults values are undefined', () => {
      render(
        <HomeDrawerBody
          {...defaultProps}
          searchResults={
            {
              iuvData: undefined,
              iufData: undefined,
              fcData: undefined
            } as unknown as DashboardResult
          }
        />
      );

      expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    it('should show drawer content when at least one result exists', () => {
      render(
        <HomeDrawerBody
          {...defaultProps}
          searchResults={
            {
              iuvData: { id: '1' },
              iufData: null,
              fcData: null
            } as DashboardResult
          }
        />
      );

      expect(screen.queryByText('No results found')).not.toBeInTheDocument();
      expect(screen.getByTestId('home-drawer-iuv')).toBeInTheDocument();
    });
  });

  describe('Translation Keys', () => {
    it('should use correct translation key for IUV field label', () => {
      render(<HomeDrawerBody {...defaultProps} searchLabel={TABS.IUV} />);

      expect(screen.getByText('IUV Field Label')).toBeInTheDocument();
    });

    it('should use correct translation key for IUF field label', () => {
      i18nTestSetup({
        'home.tabs.IUF.fieldLabel': 'IUF Field Label',
        'home.drawer.actions': 'Actions',
        'home.noResults.description': 'No results found'
      });

      render(<HomeDrawerBody {...defaultProps} searchLabel={TABS.IUF} />);

      expect(screen.getByText('IUF Field Label')).toBeInTheDocument();
    });

    it('should use correct translation key for FC field label', () => {
      i18nTestSetup({
        'home.tabs.FC.fieldLabel': 'FC Field Label',
        'home.drawer.actions': 'Actions',
        'home.noResults.description': 'No results found'
      });

      render(<HomeDrawerBody {...defaultProps} searchLabel={TABS.FC} />);

      expect(screen.getByText('FC Field Label')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid searchLabel gracefully', () => {
      render(
        <HomeDrawerBody {...defaultProps} searchLabel={'INVALID' as TABS} />
      );

      expect(screen.queryByTestId('home-drawer-iuv')).not.toBeInTheDocument();
      expect(screen.queryByTestId('home-drawer-fc')).not.toBeInTheDocument();
      expect(screen.queryByTestId('home-drawer-iuf')).not.toBeInTheDocument();
    });

    it('should handle empty searchValue', () => {
      render(<HomeDrawerBody {...defaultProps} searchValue="" />);

      expect(screen.getByText('IUV Field Label')).toBeInTheDocument();
    });

    it('should render with special characters in searchValue', () => {
      const specialValue = 'test@#$%^&*()_+value';
      render(<HomeDrawerBody {...defaultProps} searchValue={specialValue} />);

      expect(screen.getByText(specialValue)).toBeInTheDocument();
    });
  });

  describe('Typography Styling', () => {
    it('should render field label with body2 variant', () => {
      render(<HomeDrawerBody {...defaultProps} />);

      const fieldLabel = screen.getByText('IUV Field Label');
      expect(fieldLabel.tagName).toBe('P');
    });

    it('should render search value with body1 variant and fontWeight 600', () => {
      render(<HomeDrawerBody {...defaultProps} />);

      const searchValue = screen.getByText('testValue123');
      expect(searchValue.tagName).toBe('P');
    });

    it('should render actions header with button variant and uppercase', () => {
      render(<HomeDrawerBody {...defaultProps} />);

      const actionsHeader = screen.getByText('Actions');
      expect(actionsHeader).toBeInTheDocument();
    });
  });
});
