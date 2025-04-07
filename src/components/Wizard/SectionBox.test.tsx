import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import SectionBox from './SectionBox';

// Mock di react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

// Mock dell'icona
vi.mock('@mui/icons-material/MenuBook', () => ({
  default: () => <div data-testid="book-icon">BookIcon</div>
}));

describe('SectionBox', () => {
  // Test del rendering con titolo e contenuto
  test('renders correctly with title and children', () => {
    render(
      <SectionBox title="Test Title">
        <div data-testid="child-content">Child Content</div>
      </SectionBox>
    );

    // Verifica che il titolo sia renderizzato
    const titleElement = screen.getByText('Test Title');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement.tagName).toBe('H6');

    // Verifica che l'icona sia renderizzata
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

  // Test del rendering con solo titolo (senza figli)
  test('renders correctly with only title', () => {
    render(<SectionBox title="Test Title" />);

    // Verifica che il titolo sia renderizzato
    expect(screen.getByText('Test Title')).toBeInTheDocument();

    // Verifica che l'icona sia renderizzata
    expect(screen.getByTestId('book-icon')).toBeInTheDocument();

    // Verifica che non ci siano figli aggiuntivi oltre l'header
    expect(screen.queryByTestId('child-content')).toBeNull();
  });

  // Test del rendering con titolo vuoto
  test('renders correctly with empty title', () => {
    render(
      <SectionBox title="">
        <div data-testid="child-content">Child Content</div>
      </SectionBox>
    );

    // Verifica che l'icona sia renderizzata
    expect(screen.getByTestId('book-icon')).toBeInTheDocument();

    // Verifica che il contenuto figlio sia renderizzato
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  // Test aggiuntivo per verificare la presenza dell'icona e del suo container
  test('renders icon correctly', () => {
    render(<SectionBox title="Test Title" />);

    // Verifica la presenza dell'icona
    const iconElement = screen.getByTestId('book-icon');
    expect(iconElement).toBeInTheDocument();

    // Verifica che l'icona e il titolo siano nella stessa area
    const headerBox =
      iconElement.closest('div[display="flex"]') ||
      iconElement.parentElement?.closest('div') ||
      iconElement.parentElement;

    expect(headerBox).not.toBeNull();
    if (headerBox) {
      expect(headerBox.textContent).toContain('Test Title');
    }
  });
});
