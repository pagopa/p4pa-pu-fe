import { describe, expect, it, Mock, vi } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import { useLocation } from 'react-router';
import FilterContainer from '../FilterContainer/FilterContainer';
import TelematicReceiptSearchResults from '../../routes/TelematicReceiptSearchResults';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useLocation: vi.fn(),
  useNavigate: vi.fn(),
  useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()])
}));

vi.mock('../../hooks/useTelematicReceiptsFilters', () => ({
  default: vi.fn(() => ({
    filters: []
  }))
}));

vi.mock('../../components/TitleComponent/TitleComponent', () => ({
  default: vi.fn(({ title }) => <div>{title}</div>)
}));

vi.mock(
  '../../components/FilterContainer/FilterContainer',
  async (importOriginal) => ({
    ...(await importOriginal()),
    default: vi.fn(() => <div>FilterContainer</div>)
  })
);

describe('TelematicReceiptSearchResults', () => {
  it('should render correctly', () => {
    (useLocation as Mock).mockReturnValue({ state: { filters: {} } });

    render(<TelematicReceiptSearchResults />);

    expect(
      screen.getByText('commons.routes.TELEMATIC_RECEIPT_SEARCH_RESULTS')
    ).toBeInTheDocument();
    expect(screen.getByText('commons.iuv')).toBeInTheDocument();
  });

  it('should pass correct props to FilterContainer', () => {
    (useLocation as Mock).mockReturnValue({ state: { filters: {} } });

    render(<TelematicReceiptSearchResults />);

    expect(FilterContainer).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.any(Array),
        values: expect.any(Object),
        onChange: expect.any(Function)
      }),
      expect.anything()
    );
  });
});
