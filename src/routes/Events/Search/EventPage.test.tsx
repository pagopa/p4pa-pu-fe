/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventPage } from './index';

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('../configs', () => ({
  tabs: [
    { label: 'events.tabs.sil', id: 'sil' },
    { label: 'events.tabs.nodo', id: 'pagopa' }
  ]
}));

vi.mock('../..', () => ({
  PageRoutes: {
    BACKOFFICE_REGISTRY_LIST: '/backoffice/events/:registryType'
  }
}));

const mockEncode = vi.fn().mockReturnValue('encoded-filters');
vi.mock('../../../utils', () => ({
  __esModule: true,
  default: {
    URI: {
      encode: (...args: Array<any>) => mockEncode(...args),
      decode: vi.fn()
    }
  }
}));

const mockNoFilterSetted = vi.fn();
const mockShouldShowGeneralError = vi.fn();
vi.mock('../../../utils/filtersValidation', () => ({
  noFilterSetted: (...args: Array<any>) => mockNoFilterSetted(...args),
  shouldShowGeneralError: (...args: Array<any>) =>
    mockShouldShowGeneralError(...args)
}));

vi.mock('../../../components/TitleComponent/TitleComponent', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => (
    <h1 data-testid="main-title">{title}</h1>
  )
}));

vi.mock('../../../components/ErrorMessage/ErrorMessage', () => ({
  __esModule: true,
  ErrorMessage: () => <div role="alert">common.errors.general</div>
}));

const mockSearchCard = vi.fn();
vi.mock('../../../components/SearchCard/SearchCard', () => ({
  __esModule: true,
  default: (props: any) => {
    mockSearchCard(props);

    const {
      title,
      description,
      tabsConfig,
      activeTabIndex,
      onTabChange,
      button,
      render: renderError
    } = props;

    return (
      <div data-testid="search-card">
        <h2>{title}</h2>
        <p>{description}</p>
        <div role="tablist">
          {tabsConfig.map((t: any, idx: number) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={idx === activeTabIndex}
              onClick={() => onTabChange(idx)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {renderError}
        <div>
          {button?.map((b: any, idx: number) => (
            <button
              key={idx}
              type={b.variant === 'contained' ? 'submit' : 'button'}
              onClick={b.onClick ?? props.onSubmit}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    );
  }
}));

describe('EventPage (fixed tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNoFilterSetted.mockReturnValue(false);
    mockShouldShowGeneralError.mockReturnValue(false);
  });

  it('renders the correct title', () => {
    render(<EventPage />);

    expect(screen.getByTestId('main-title')).toHaveTextContent(
      'commons.routes.BACKOFFICE_EVENTS'
    );
  });

  it('renders SearchCard with translated title and description', () => {
    render(<EventPage />);

    expect(screen.getByTestId('search-card')).toBeInTheDocument();
    expect(screen.getByText('events.searchCardTitle')).toBeInTheDocument();
    expect(
      screen.getByText('events.searchCardDescription')
    ).toBeInTheDocument();
  });

  it('shows two configured tabs (SIL and pagopa)', () => {
    render(<EventPage />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveTextContent('events.tabs.sil');
    expect(tabs[1]).toHaveTextContent('events.tabs.nodo');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('clears filters and hides error when changing tab', async () => {
    const user = userEvent.setup();

    mockNoFilterSetted.mockReturnValue(true);
    mockShouldShowGeneralError.mockReturnValue(true);

    render(<EventPage />);

    const tabs = screen.getAllByRole('tab');
    await user.click(tabs[1]);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('clicking "commons.filters.remove" calls SearchCard and resets', async () => {
    const user = userEvent.setup();
    render(<EventPage />);

    const removeBtn = screen.getByText('commons.filters.remove');
    await user.click(removeBtn);

    expect(mockSearchCard).toHaveBeenCalled();
  });

  it('clicking "commons.filters.filterResults" with at least one filter navigates to sil registry by default', async () => {
    const user = userEvent.setup();

    mockNoFilterSetted.mockReturnValue(false);

    render(<EventPage />);

    const filterBtn = screen.getByText('commons.filters.filterResults');
    await user.click(filterBtn);

    expect(mockEncode).toHaveBeenCalledWith({});
    expect(mockNavigate).toHaveBeenCalledWith(
      '/backoffice/events/sil#encoded-filters'
    );
  });

  it('clicking "commons.filters.filterResults" with no filters shows error and does not navigate', async () => {
    const user = userEvent.setup();

    mockNoFilterSetted.mockReturnValue(true);
    mockShouldShowGeneralError.mockReturnValue(true);

    render(<EventPage />);

    const filterBtn = screen.getByText('commons.filters.filterResults');
    await user.click(filterBtn);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates with "pagopa" registry when second tab is active', async () => {
    const user = userEvent.setup();

    mockNoFilterSetted.mockReturnValue(false);

    render(<EventPage />);

    const tabs = screen.getAllByRole('tab');
    await user.click(tabs[1]);

    const filterBtn = screen.getByText('commons.filters.filterResults');
    await user.click(filterBtn);

    expect(mockNavigate).toHaveBeenCalledWith(
      '/backoffice/events/pagopa#encoded-filters'
    );
  });

  it('calls shouldShowGeneralError with current filters when filters are not set', async () => {
    const user = userEvent.setup();

    mockNoFilterSetted.mockReturnValue(true);
    mockShouldShowGeneralError.mockReturnValue(true);

    render(<EventPage />);

    const filterBtn = screen.getByText('commons.filters.filterResults');
    await user.click(filterBtn);

    expect(mockShouldShowGeneralError).toHaveBeenCalledWith({});
  });

  it('passes current filters to utils.URI.encode without changing implementation', async () => {
    const user = userEvent.setup();

    mockNoFilterSetted.mockReturnValue(false);

    render(<EventPage />);

    const lastCall = mockSearchCard.mock.calls.at(-1);
    const props = lastCall?.[0];
    await props.onFilterChange('iuv', '1234567890');

    const filterBtn = screen.getByText('commons.filters.filterResults');
    await user.click(filterBtn);

    expect(mockEncode).toHaveBeenCalledWith({ iuv: '1234567890' });
    expect(mockNavigate).toHaveBeenCalledWith(
      '/backoffice/events/sil#encoded-filters'
    );
  });
});
