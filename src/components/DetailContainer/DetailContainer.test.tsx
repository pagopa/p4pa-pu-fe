import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DetailContainer from '../DetailContainer/DetailContainer';

describe('DetailContainer', () => {
  const mockProps = {
    sections: [
      {
        title: 'commons.summary',
        data: [
          { label: 'IUV', value: '03234234234324', variant: 'monospaced' as const },
          { label: 'Importo', value: '80,00 €' },
        ]
      },
      {
        title: 'commons.payment',
        data: [
          { label: 'Pagatore', value: 'Maria Bianchi [CF/PIVA: BNCMRA82B42C933X (Persona fisica)]' },
          { label: 'Stato', value: 'Pagato' }
        ],
      },
    ],
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
    expect(screen.getByText('Maria Bianchi [CF/PIVA: BNCMRA82B42C933X (Persona fisica)]')).toBeDefined();
  });

  it('renders with Chip', () => {
    render(<DetailContainer {...mockProps} />);

    const statusChip = screen.getByText('Pagato');
    expect(statusChip).toBeDefined();
    expect(statusChip).toHaveClass('MuiChip-label');
  });

  it('renders "-" for empty values', () => {
    const missingValuesProps = {
      sections: [
        {
          data: [
            { label: 'Ordinante', value: '' },
            { label: 'Conto', value: '' },
          ],
        },
      ],
    };

    render(<DetailContainer {...missingValuesProps} />);

    const firstLabelDiv = screen.getByText('Ordinante').closest('div');
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
          title: 'commons.summary',
          inline: true,
          data: [
            { label: 'Codice Boletta', value: '2000777' },
            { label: 'Anno Boletta', value: '2024' },
          ],
        },
      ],
    };
  
    render(<DetailContainer {...inlineProps} />);
  
    const gridContainer = screen.getByText('Codice Boletta').closest('.MuiGrid-container');
    expect(gridContainer?.querySelector('.MuiGrid-item.MuiGrid-grid-md-6')).not.toBeNull();
    expect(gridContainer?.querySelector('.MuiGrid-item.MuiGrid-grid-md-12')).toBeNull();
  });
  
  it('renders non-inline layout with correct Grid direction and sizes', () => {
    const nonInlineProps = {
      sections: [
        {
          title: 'commons.summary',
          inline: false,
          data: [
            { label: 'Codice Boletta', value: '2000777' },
            { label: 'Anno Boletta', value: '2024' },
          ],
        },
      ],
    };

    render(<DetailContainer {...nonInlineProps} />);
  
    const gridContainer = screen.getByText('Codice Boletta').closest('.MuiGrid-container');
    expect(gridContainer?.querySelector('.MuiGrid-item.MuiGrid-grid-md-6')).toBeNull();
    expect(gridContainer?.querySelector('.MuiGrid-item.MuiGrid-grid-md-12')).not.toBeNull();
  });  
});
