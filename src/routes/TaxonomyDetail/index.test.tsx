import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { TaxonomyDetailPage } from '.';
import { render } from '../../__tests__/renderers';
import { getTaxonomyDetail } from '../../api/taxonomy';

vi.mock('../../api/taxonomy', () => ({
  getTaxonomyDetail: vi.fn()
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ taxonomyId: '705' }),
    Navigate: vi.fn(({ to }) => <div>Navigate to {to}</div>),
    useNavigate: () => vi.fn()
  };
});

describe('Taxonomy Detail Page', () => {
  const dataMock = {
    creationDate: '2025-02-20T09:23:17.977642',
    updateDate: '2025-05-27T17:23:33.402746',
    updateOperatorExternalId: 'WS_USER',
    updateTraceId: 'ecc6c6bf5df88ea1c3500676734d173e',
    taxonomyId: 705,
    organizationType: '10',
    organizationTypeDescription: "AUTORITA' AMMINISTRATIVE INDIPENDENTI",
    macroAreaCode: '15',
    macroAreaName: 'Autorità Idrica',
    macroAreaDescription: 'Settore idrico',
    serviceTypeCode: '100',
    serviceType: 'tassa concorso',
    serviceTypeDescription: 'tassa per la partecipazione ai concorsi',
    collectionReason: 'TS',
    startDateValidity: '2024-08-01T00:00:00.000000',
    endDateOfValidity: '2080-01-01T00:00:00.000000',
    taxonomyCode: '9/1004100TS/',
    _links: {
      self: {
        href: 'http://:8080/crud/taxonomies/705'
      },
      taxonomy: {
        href: 'http://:8080/crud/taxonomies/705'
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (getTaxonomyDetail as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: dataMock
    });
  });

  it('renders Taxonomy Detail without crashing', () => {
    render(<TaxonomyDetailPage />);

    expect(screen.getByText(dataMock.taxonomyCode)).toBeInTheDocument();
  });
});
