import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WizardStepButtons from './WizardStepButtons';

// Mock della funzione di traduzione
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => {
      if (key === 'commons.back') return 'Indietro';
      if (key === 'commons.continue') return 'Continua';
      return key;
    }
  }))
}));

describe('WizardStepButtons', () => {
  it('renderizza correttamente i pulsanti con le etichette predefinite', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();

    render(<WizardStepButtons onNext={onNext} onBack={onBack} />);

    // Verifica che i pulsanti siano presenti con le etichette predefinite
    expect(screen.getByText('Indietro')).toBeInTheDocument();
    expect(screen.getByText('Continua')).toBeInTheDocument();
  });

  it("utilizza l'etichetta personalizzata per il pulsante Next quando fornita", () => {
    const onNext = vi.fn();
    const onBack = vi.fn();

    render(
      <WizardStepButtons onNext={onNext} onBack={onBack} nextLabel="Avanti" />
    );

    // Verifica che il pulsante Next abbia l'etichetta personalizzata
    expect(screen.getByText('Avanti')).toBeInTheDocument();
  });

  it('chiama onNext quando il pulsante Next viene cliccato', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();

    render(<WizardStepButtons onNext={onNext} onBack={onBack} />);

    // Clicca sul pulsante Next
    fireEvent.click(screen.getByText('Continua'));

    // Verifica che onNext sia stato chiamato
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('chiama onBack quando il pulsante Back viene cliccato', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();

    render(<WizardStepButtons onNext={onNext} onBack={onBack} />);

    // Clicca sul pulsante Back
    fireEvent.click(screen.getByText('Indietro'));

    // Verifica che onBack sia stato chiamato
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('disabilita il pulsante Next quando disableNext è true', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();

    render(
      <WizardStepButtons onNext={onNext} onBack={onBack} disableNext={true} />
    );

    // Verifica che il pulsante Next sia disabilitato
    expect(screen.getByText('Continua')).toBeDisabled();
  });

  it('disabilita il pulsante Back quando disableBack è true', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();

    render(
      <WizardStepButtons onNext={onNext} onBack={onBack} disableBack={true} />
    );

    // Verifica che il pulsante Back sia disabilitato
    expect(screen.getByText('Indietro')).toBeDisabled();
  });

  it('non chiama onBack quando il pulsante Back è disabilitato e viene cliccato', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();

    render(
      <WizardStepButtons onNext={onNext} onBack={onBack} disableBack={true} />
    );

    // Clicca sul pulsante Back disabilitato
    fireEvent.click(screen.getByText('Indietro'));

    // Verifica che onBack non sia stato chiamato
    expect(onBack).not.toHaveBeenCalled();
  });

  it('non chiama onNext quando il pulsante Next è disabilitato e viene cliccato', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();

    render(
      <WizardStepButtons onNext={onNext} onBack={onBack} disableNext={true} />
    );

    // Clicca sul pulsante Next disabilitato
    fireEvent.click(screen.getByText('Continua'));

    // Verifica che onNext non sia stato chiamato
    expect(onNext).not.toHaveBeenCalled();
  });

  it('funziona correttamente quando onBack non è fornito', () => {
    const onNext = vi.fn();

    render(<WizardStepButtons onNext={onNext} />);

    // Verifica che il pulsante Back sia presente
    expect(screen.getByText('Indietro')).toBeInTheDocument();

    // Clicca sul pulsante Back
    fireEvent.click(screen.getByText('Indietro'));

    // Non dovrebbe generare errori
  });
});
