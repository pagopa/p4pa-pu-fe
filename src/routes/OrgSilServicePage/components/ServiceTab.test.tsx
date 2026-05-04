import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material';
import { ServiceTabs } from './ServiceTab';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'service.tab1': 'Tab 1',
        'service.tab2': 'Tab 2',
        'service.tab3': 'Tab 3'
      };
      return translations[key] || key;
    }
  })
}));

describe('ServiceTabs', () => {
  const theme = createTheme();
  const mockOnTabChange = vi.fn();

  const mockServiceConfigs = {
    0: { labelKey: 'service.tab1' },
    1: { labelKey: 'service.tab2' },
    2: { labelKey: 'service.tab3' }
  };

  const defaultProps = {
    activeTab: 0,
    onTabChange: mockOnTabChange,
    serviceConfigs: mockServiceConfigs
  };

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <ServiceTabs {...defaultProps} {...props} />
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all tabs with correct labels', () => {
    renderComponent();

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });

  it('should have first tab active by default', () => {
    renderComponent();

    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab1).toHaveAttribute('aria-selected', 'true');
  });

  it('should show correct active tab', () => {
    renderComponent({ activeTab: 1 });

    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    expect(tab2).toHaveAttribute('aria-selected', 'true');
  });

  it('should call onTabChange when tab is clicked', () => {
    renderComponent();

    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    fireEvent.click(tab2);

    expect(mockOnTabChange).toHaveBeenCalledWith(1);
  });

  it('should handle single tab configuration', () => {
    const singleTabConfig = {
      0: { labelKey: 'service.tab1' }
    };

    renderComponent({ serviceConfigs: singleTabConfig });

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.queryByText('Tab 2')).not.toBeInTheDocument();
  });

  it('should handle empty configuration', () => {
    renderComponent({ serviceConfigs: {} });

    expect(screen.queryByText('Tab 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Tab 2')).not.toBeInTheDocument();
  });

  it('should maintain tab order based on config keys', () => {
    const reorderedConfig = {
      0: { labelKey: 'service.tab1' },
      1: { labelKey: 'service.tab2' },
      2: { labelKey: 'service.tab3' }
    };

    renderComponent({ serviceConfigs: reorderedConfig });

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveTextContent('Tab 1');
    expect(tabs[1]).toHaveTextContent('Tab 2');
    expect(tabs[2]).toHaveTextContent('Tab 3');
  });
});
