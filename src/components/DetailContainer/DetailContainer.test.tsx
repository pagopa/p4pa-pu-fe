import { describe, it, expect } from 'vitest';
import { render, screen } from '../../__tests__/renderers';
import DetailContainer, {
  DetailSectionProps
} from '../DetailContainer/DetailContainer';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'commons.state': 'Stato',
        'commons.amount': 'Importo',
        'commons.status.PAID': 'commons.status.PAID'
      };
      return translations[key] || key;
    }
  })
}));

describe('DetailContainer', () => {
  const mockProps: DetailSectionProps = {
    sections: [
      {
        title: { label: 'commons.summary' },
        data: [
          {
            label: 'IUV',
            value: '03234234234324',
            variant: 'monospaced' as const
          },
          { label: 'Importo', value: 8000, valueType: 'amount' }
        ]
      },
      {
        title: { label: 'commons.payment' },
        data: [
          {
            label: 'Pagatore',
            value: 'Maria Bianchi [CF/PIVA: BNCMRA82B42C933X (Persona fisica)]'
          },
          { label: 'Stato', value: 'PAID', valueType: 'status' }
        ]
      }
    ]
  };

  it('renders sections with titles and values', () => {
    render(<DetailContainer {...mockProps} />);

    expect(screen.getByText(/commons.summary/i)).toBeDefined();
    expect(screen.getByText(/commons.payment/i)).toBeDefined();

    expect(screen.getByText('IUV')).toBeDefined();
    expect(screen.getByText('03234234234324')).toBeDefined();
    expect(screen.getByText('Importo')).toBeDefined();
    expect(screen.getByText('80,00 €')).toBeDefined();
    expect(screen.getByText('Pagatore')).toBeDefined();
    expect(
      screen.getByText(
        'Maria Bianchi [CF/PIVA: BNCMRA82B42C933X (Persona fisica)]'
      )
    ).toBeDefined();
  });

  it('renders with Chip', () => {
    render(<DetailContainer {...mockProps} />);

    const statusChip = screen.getByText('commons.status.PAID');
    expect(statusChip).toBeDefined();
    expect(statusChip).toHaveClass('MuiChip-label');
  });

  it('renders "-" for empty values', () => {
    const missingValuesProps = {
      sections: [
        {
          data: [
            { label: 'Gestore della transazione (PSP)', value: '' },
            { label: 'Conto', value: '' }
          ]
        }
      ]
    };

    render(<DetailContainer {...missingValuesProps} />);

    const firstLabelDiv = screen
      .getByText('Gestore della transazione (PSP)')
      .closest('div');
    const firstValueDiv = firstLabelDiv?.nextElementSibling;
    expect(firstValueDiv).toHaveTextContent('-');

    const secondLabelDiv = screen.getByText('Conto').closest('div');
    const secondValueDiv = secondLabelDiv?.nextElementSibling;
    expect(secondValueDiv).toHaveTextContent('-');
  });

  it('renders inline layout with correct Grid direction and size', () => {
    const inlineProps = {
      sections: [
        {
          title: { label: 'commons.summary' },
          inline: true,
          data: [
            { label: 'Codice Boletta', value: '2000777' },
            { label: 'Anno Boletta', value: '2024' }
          ]
        }
      ]
    };

    render(<DetailContainer {...inlineProps} />);

    const gridContainer = screen
      .getByText('Codice Boletta')
      .closest('.MuiGrid-container');
    expect(
      gridContainer?.querySelector('.MuiGrid-item.MuiGrid-grid-md-6')
    ).not.toBeNull();
    expect(
      gridContainer?.querySelector('.MuiGrid-item.MuiGrid-grid-md-12')
    ).toBeNull();
  });

  it('renders non-inline layout with correct Grid direction and sizes', () => {
    const nonInlineProps = {
      sections: [
        {
          title: { label: 'commons.summary' },
          inline: false,
          data: [
            { label: 'Codice Boletta', value: '2000777' },
            { label: 'Anno Boletta', value: '2024' }
          ]
        }
      ]
    };

    render(<DetailContainer {...nonInlineProps} />);

    const gridContainer = screen
      .getByText('Codice Boletta')
      .closest('.MuiGrid-container');
    expect(
      gridContainer?.querySelector('.MuiGrid-item.MuiGrid-grid-md-6')
    ).toBeNull();
    expect(
      gridContainer?.querySelector('.MuiGrid-item.MuiGrid-grid-md-12')
    ).not.toBeNull();
  });

  it('renders description when provided', () => {
    const propsWithDescription = {
      sections: [
        {
          title: { label: 'Test Title' },
          description: 'This is a test description',
          data: [{ label: 'Test Label', value: 'Test Value' }]
        }
      ]
    };

    render(<DetailContainer {...propsWithDescription} />);

    expect(screen.getByText('This is a test description')).toBeDefined();
    expect(screen.getByText('Test Title')).toBeDefined();
  });

  it('renders date values correctly', () => {
    const propsWithDate = {
      sections: [
        {
          data: [
            {
              label: 'Data Valida',
              value: '2024-12-31',
              valueType: 'date' as const
            },
            { label: 'Data Vuota', value: '', valueType: 'date' as const }
          ]
        }
      ]
    };

    render(<DetailContainer {...propsWithDate} />);

    expect(screen.getByText('Data Valida')).toBeDefined();
    expect(screen.getByText('Data Vuota')).toBeDefined();
    expect(screen.getByText('-')).toBeDefined();
  });

  it('renders childrenComponent when provided', () => {
    const propsWithChildren = {
      sections: [
        {
          data: [
            {
              label: 'Custom Component',
              childrenComponent: (
                <div data-testid="custom-component">Custom Content</div>
              )
            }
          ]
        }
      ]
    };

    render(<DetailContainer {...propsWithChildren} />);

    expect(screen.getByTestId('custom-component')).toBeDefined();
    expect(screen.getByText('Custom Content')).toBeDefined();
  });

  it('renders footer link with icon and handles click', () => {
    const mockOnLinkClick = vi.fn();
    const propsWithFooterLink = {
      sections: [
        {
          data: [{ label: 'Test Data', value: 'Test Value' }],
          footerLink: {
            label: 'Show Details',
            icon: <span data-testid="footer-icon">📄</span>,
            onLinkClick: mockOnLinkClick,
            iconPosition: 'left' as const
          }
        }
      ]
    };

    render(<DetailContainer {...propsWithFooterLink} />);

    const footerButton = screen.getByText('Show Details');
    expect(footerButton).toBeDefined();
    expect(footerButton).toHaveClass('MuiButton-text');
    expect(screen.getByTestId('footer-icon')).toBeDefined();

    footerButton.click();
    expect(mockOnLinkClick).toHaveBeenCalledOnce();
  });
});
