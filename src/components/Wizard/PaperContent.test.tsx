import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import PaperContent from './PaperContent';

// Mock dell'icona predefinita
vi.mock('@mui/icons-material/MenuBook', () => ({
  default: () => <div data-testid="book-icon">BookIcon</div>
}));

describe('PaperContent', () => {
  // Test del rendering con titolo e contenuto
  test('renders correctly with title and children', () => {
    render(
      <PaperContent title="Test Title">
        <div data-testid="child-content">Child Content</div>
      </PaperContent>
    );

    // Verifica che il titolo sia renderizzato
    const titleElement = screen.getByText('Test Title');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement.tagName).toBe('H6');

    // Verifica che l'icona predefinita sia renderizzata
    const iconElement = screen.getByTestId('book-icon');
    expect(iconElement).toBeInTheDocument();

    // Verifica che il contenuto figlio sia renderizzato
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();

    // Verifica che l'icona e il titolo siano nello stesso container
    const iconParent = iconElement.parentElement;
    expect(iconParent).not.toBeNull();
    if (iconParent) {
      // Verifica che il container dell'icona sia anche il parent o un antenato del titolo
      expect(
        iconParent.contains(titleElement) ||
          iconParent.parentElement?.contains(titleElement)
      ).toBeTruthy();
    }
  });

  // Test del rendering con icona personalizzata
  test('renders correctly with custom icon', () => {
    const CustomIcon = () => <div data-testid="custom-icon">CustomIcon</div>;

    render(
      <PaperContent title="Test Title" icon={<CustomIcon />}>
        <div data-testid="child-content">Child Content</div>
      </PaperContent>
    );

    // Verifica che l'icona personalizzata sia renderizzata
    const customIconElement = screen.getByTestId('custom-icon');
    expect(customIconElement).toBeInTheDocument();
    expect(screen.getByText('CustomIcon')).toBeInTheDocument();

    // Verifica che l'icona predefinita NON sia renderizzata
    expect(screen.queryByTestId('book-icon')).toBeNull();

    // Verifica che il titolo sia renderizzato
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  // Test del rendering con solo titolo (senza figli)
  test('renders correctly with only title', () => {
    render(
      <PaperContent title="Test Title">
        <></>
      </PaperContent>
    );

    // Verifica che il titolo sia renderizzato
    expect(screen.getByText('Test Title')).toBeInTheDocument();

    // Verifica che l'icona predefinita sia renderizzata
    expect(screen.getByTestId('book-icon')).toBeInTheDocument();

    // Verifica che non ci siano figli aggiuntivi oltre l'header
    expect(screen.queryByTestId('child-content')).toBeNull();
  });

  // Test del rendering con titolo vuoto
  test('renders correctly with empty title', () => {
    render(
      <PaperContent title="">
        <div data-testid="child-content">Child Content</div>
      </PaperContent>
    );

    // Verifica che l'icona predefinita sia renderizzata
    expect(screen.getByTestId('book-icon')).toBeInTheDocument();

    // Verifica che il contenuto figlio sia renderizzato
    expect(screen.getByTestId('child-content')).toBeInTheDocument();

    // Verifica che il titolo vuoto sia renderizzato in un elemento Typography
    const titleElements = screen.getAllByRole('heading', { level: 6 });
    expect(titleElements.length).toBeGreaterThan(0);
    expect(titleElements[0].textContent).toBe('');
  });

  // Test aggiuntivo per verificare la presenza del Paper e del suo stile
  test('renders Paper with correct styling', () => {
    render(
      <PaperContent title="Test Title">
        <></>
      </PaperContent>
    );

    // Verifica la presenza del Paper
    const paperElement = screen
      .getByText('Test Title')
      .closest('div[class*="MuiPaper"]');
    expect(paperElement).not.toBeNull();

    // Verifica che il Paper contenga il titolo e l'icona
    if (paperElement) {
      expect(paperElement.textContent).toContain('Test Title');
      expect(paperElement.textContent).toContain('BookIcon');
    }
  });
});
